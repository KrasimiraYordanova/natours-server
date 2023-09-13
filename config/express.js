const express = require('express');
const trim = require('../middlewares/trim');
const session = require('../middlewares/session');

function templateConfig(app) {

    app.use(express.json());
    // CORS
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'HEAD, OPTIONS, GET, POST, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        next();
    })
    app.use(trim());
    app.use(session());

}

module.exports = templateConfig;