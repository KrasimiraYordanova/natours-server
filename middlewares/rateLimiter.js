// preventing the same IP to making to many requests to our API and that will then help us preventing attacks like DOS(denial of service) or brute force attacks
// npm i express-rate-limit
// creating as a global middleware
const rateLimiter = require('express-rate-limit');

// 1. creating a limiter
const limiter = rateLimiter({
    max: 100,
    windowMs: 60*60*1000,
    message: "Too many request from this IP, please try again in an hour"
})

module.exports = limiter;