import remixFastify from "./remix-fastify.mjs";
import { fastify } from "fastify";

const app = fastify();

await app.register(remixFastify)

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

