const fastify = require('fastify');
const remixFastify = require("@exortek/remix-fastify");


const app = fastify();

app.register(remixFastify({
    buildDirectory: 'build',
    clientDirectory: 'build/client',
    serverDirectory: 'build/server',
    serverBuildFile: 'build/server/build.js',
    mode: process.env.NODE_ENV,
    fastifyStaticOptions: {},
    viteOptions: {}
}));

app.listen({
    port: 3000,
    host: "127.0.0.1"
}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
});
