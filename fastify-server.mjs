import remixFastify from "@exortek/remix-fastify";
import { fastify } from "fastify";

const app = fastify();

await app.register(remixFastify({
    buildDirectory: 'build',
    clientDirectory: 'client',
    serverDirectory: 'server',
    serverBuildFile: 'index.js',
    mode: process.env.NODE_ENV || 'development',
    fastifyStaticOptions: {},
    viteOptions: {},
}))

app.listen({
    port: 3000,
    host: "127.0.0.1"
}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
})

