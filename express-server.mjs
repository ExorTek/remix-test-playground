import express from 'express';
import { remixExpress } from '@exortek/remix-express';


const app = express();

app.use(express.static('build/client'));

app.use(
    remixExpress({
        build: () => import('./build/server/index.js'),
        mode: process.env.NODE_ENV,
    })
);

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
})
