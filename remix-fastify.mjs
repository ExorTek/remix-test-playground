import path from "node:path";
import fastifyPlugin from "fastify-plugin";
import { createReadableStreamFromReadable, createRequestHandler as createRemixRequestHandler } from "@remix-run/node";
import { Readable } from "node:stream";
import { cacheHeader } from "pretty-cache-header";
import * as url from "node:url";

const getUrl = (protocol, hostname, originalUrl) =>
    new URL(`${protocol}://${hostname}${originalUrl}`);

const responseToReadable = (response) => {
    if (!response.body) return null;

    const reader = response.body.getReader();
    return new Readable({
        async read() {
            const { done, value } = await reader.read();
            if (done) {
                this.push(null);
                return reader.cancel();
            }
            this.push(Buffer.from(value));
        }
    });
};

const sendRemixResponse = async (reply, result) => {
    reply.headers(Object.fromEntries(result.headers));

    if (result.body) {
        return reply.send(responseToReadable(result.clone()));
    }
    return reply.send(await result.text());
};

const createRemixRequest = (req, rep) => {
    const url = getUrl(req.protocol, req.hostname, req.originalUrl);
    const abortController = new AbortController();

    rep.raw.on("close", () => abortController.abort());

    const init = {
        method: req.method,
        headers: req.headers,
        signal: abortController.signal,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
        init.body = createReadableStreamFromReadable(req.raw);
        init.duplex = "half";
    }

    return new Request(url, init);
};

const createRequestHandler = ({ build, getLoadContext, mode = process.env.NODE_ENV }) => {
    const handler = createRemixRequestHandler(build, mode);

    return async (request, reply) => {
        const remixRequest = createRemixRequest(request, reply);
        const loadContext = getLoadContext ? await getLoadContext(request, reply) : undefined;
        const result = await handler(remixRequest, loadContext);
        return sendRemixResponse(reply, result);
    };
};

const DEFAULT_OPTIONS = {
    basename: "/",
    buildDirectory: "build",
    serverBuildFile: "index.js",
    mode: process.env.NODE_ENV,
    assetCacheControl: { public: true, maxAge: "1 year", immutable: true },
    defaultCacheControl: { public: true, maxAge: "1 hour" },
};

const remixFastify = fastifyPlugin(
    async (fastify, options) => {
        const {
            basename,
            buildDirectory,
            serverBuildFile,
            getLoadContext,
            mode,
            viteOptions,
            fastifyOptions,
            assetCacheControl,
            defaultCacheControl,
            productionServerBuild,
        } = { ...DEFAULT_OPTIONS, ...options };

        let vite;
        if (mode !== "production") {
            const { createServer } = await import("vite");
            vite = await createServer({
                ...viteOptions,
                server: { ...viteOptions?.server, middlewareMode: true },
            });
        }

        const cwd = process.env.REMIX_ROOT ?? process.cwd();
        const mainBuildDir = path.resolve(cwd, buildDirectory);
        const serverBuildPath = path.resolve(mainBuildDir, "server", serverBuildFile);
        const serverBuildUrl = url.pathToFileURL(serverBuildPath).href;

        const remixHandler = createRequestHandler({
            mode,
            getLoadContext,
            build: vite
                ? () => vite.ssrLoadModule("virtual:remix/server-build")
                : productionServerBuild ?? (() => import(serverBuildUrl)),
        });

        if (vite) {
            await fastify.register(await import("@fastify/middie").then((mod) => mod.default));
            fastify.use(vite.middlewares);
        } else {
            const buildDir = path.join(mainBuildDir, "client");
            const assetDir = path.join(buildDir, "assets");
            const staticPlugin = await import("@fastify/static").then((mod) => mod.default);
            await fastify.register(staticPlugin, {
                root: buildDir,
                prefix: "/",
                wildcard: false,
                cacheControl: true,
                dotfiles: "allow",
                etag: true,
                serveDotFiles: true,
                lastModified: true,
                setHeaders: (res, filepath) => {
                    const isAsset = filepath.startsWith(assetDir);
                    res.setHeader(
                        "cache-control",
                        cacheHeader(isAsset ? assetCacheControl : defaultCacheControl)
                    );
                },
                ...fastifyOptions,
            });
        }

        fastify.register(async (server) => {
            server.removeAllContentTypeParsers();
            server.addContentTypeParser("*", (_request, payload, done) => done(null, payload));
            const basePath = `${basename.replace(/\/+$/, "")}/*`;
            server.all(basePath, remixHandler);
        });
    },
    {
        name: "fastify-remix",
        fastify: "5.x",
    }
);

export default remixFastify;
