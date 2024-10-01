const express = require('express');
const {createRemixExpressApp} = require('@exortek/remix-express');

(async () => {
    const app = await createRemixExpressApp({
        express,
        mode: process.env.NODE_ENV,
    });

    app.listen(3000, () => {
        console.log('Server started on http://localhost:3000');
    });
})();
