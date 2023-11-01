const express = require('express');
const trim = require('../middlewares/trim');
const session = require('../middlewares/session');
const limiter = require('../middlewares/rateLimiter');
// cookie parser
const cookieParser = require('cookie-parser');
const cookieSecret = process.env.COOKIESECRET || 'somethingWentRight';
// npm i express-mongo-sanitize
const mongoSanitize = require('express-mongo-sanitize');
// npm i xss-clean
const xss = require('xss-clean');
// preventing xss attacks
// npm i helmet
const helmet = require('helmet');
// query param polution
// npm i hpp
const hpp = require("hpp");

const cors = require('cors');


function templateConfig(app) {

    // security http headers
    app.use(helmet());
    // CORS
    // app.use((req, res, next) => {
    //     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    //     res.setHeader('Access-Control-Allow-Methods', 'HEAD, OPTIONS, GET, POST, PUT, PATCH, DELETE');
    //     res.setHeader('Access-Control-Allow-Credentials', true);
    //     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
    //     next();
    // })

    app.use(cors({
        origin: 'http://localhost:4200',
        credentials: true
      }));

    // body parser, reading data from the body into req.body
    app.use(express.json({ limit: "10kb"}));
    app.use(cookieParser());

    app.use((req, res, next) => {
      console.log(req.cookies);
      next();
    })

    // limit request from same IP
    app.use(limiter);
    // data sanitization against NoSQL query injection
    app.use(mongoSanitize());
    // data sanitization against XSS
    app.use(xss());
    // prevent param polution
    app.use(hpp({ whitelist: ["duration", "ratingAverage", "ratingQuantity", "difficulty", "price", "maxGroupSize"]}));
    app.use(trim());
    app.use(session());

}

module.exports = templateConfig;