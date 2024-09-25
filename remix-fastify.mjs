import path from "node:path";
import url from "node:url";
import fastifyPlugin from "fastify-plugin";
import { createReadableStreamFromReadable, createRequestHandler as createRemixRequestHandler } from "@remix-run/node";
import { Readable } from "node:stream";
import { cacheHeader } from "pretty-cache-header";

const getUrl = (protocol, hostname, originalUrl) => {
    const origin = `${protocol}://${hostname}`;
    const url = `${origin}${originalUrl}`;
    return new URL(url);
}


const responseToReadable = (response) => {
    if (!response.body) return null;

    const reader = response.body.getReader();
    const readable = new Readable();
    readable._read = async () => {
        const result = await reader.read();
        if (!result.done) {
            readable.push(Buffer.from(result.value));
        } else {
            readable.push(null);
            return reader.cancel();
        }
    }
}
const sendRemixResponse = async (reply, result) => {
    reply.status(result.status);

    for (let [key, values] of result.headers.entries()) {
        reply.headers({[key]: values});
    }

    if (result.body) {
        let stream = responseToReadable(result.clone());
        return reply.send(stream);
    }

    return reply.send(await result.text());
}
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

}

const createRequestHandler = (
    {
        build,
        getLoadContext,
        mode = process.env.NODE_ENV,
    }
) => {
    const handler = createRemixRequestHandler(build, mode);

    return async (request, reply) => {

        const remixRequest = createRemixRequest(request, reply);
        const loadContext = getLoadContext ? await getLoadContext(request, reply) : undefined;
        const result = await handler(remixRequest, loadContext);
        return sendRemixResponse(reply, result)
    }
};

const remixFastify = fastifyPlugin(
    async (fastify, {
        basename = "/",
        buildDirectory = "build",
        serverBuildFile = "index.js",
        getLoadContext,
        mode = process.env.NODE_ENV,
        viteOptions,
        fastifyOptions,
        assetCacheControl = {public: true, maxAge: "1 year", immutable: true},
        defaultCacheControl = {public: true, maxAge: "1 hour"},
        productionServerBuild,
    }) => { // removed 'done' from here

        let vite = undefined;
        if (mode !== "production") {
            vite = await import("vite").then(mod => {
                    return mod.createServer({
                        ...viteOptions,
                        server: {
                            ...viteOptions?.server,
                            middlewareMode: true,
                        }
                    });
                }
            );
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
            await fastify.register(await import("@fastify/static").then((mod) => mod.default), {
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
                    res.setHeaders(
                        isAsset ? cacheHeader(assetCacheControl)
                            : cacheHeader(defaultCacheControl)
                    )
                },
                ...fastifyOptions,
            });
        }

        fastify.register(async (server) => {
            server.removeAllContentTypeParsers();

            server.addContentTypeParser("*", (_request, payload, done) => {
                done(null, payload);
            });

            const basePath = basename.replace(/\/+$/, "") + "/*";

            server.all(basePath, remixHandler);
        });
    }, {
        name: "fastify-remix",
        fastify: "5.x",
    }
);

export default remixFastify;
