const { register, login, logout } = require('../services/userService');
const { body, validationResult } = require("express-validator");
const { parseError } = require('../util/parser');

const authController = require('express').Router();

authController.post('/register',
 body('email').isEmail().withMessage('Invalid email'),
 body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
 async(req, res) => {
    try {
        // catching the errros from express-validator
        const { errors } = validationResult(req);
        if(errors.length > 0) {
            throw errors;
        }
        // on register - registering the user and returning the object with token and user info
        if(req.body.password != req.body.repassword) {
            throw new Error('Passwords does not match');
        }
        const token = await register(req.body.email, req.body.password);
        res.status(200).json(token);
    } catch(err) {
        // parsing the error message
        const message = parseError(err);
        // on error - sending status code with the error message
        res.status(400).json({ message: message });
    }
})

authController.post('/login', async(req, res) => {
    try {
        const token = await login(req.body.email, req.body.password);
        res.status(200).json(token);
    } catch(err) {
        // parsing the error message
        const message = parseError(err);
        // on error - sending status code with the error message
        res.status(401).json({ message: message });
    }
})

authController.get('/logout', async(req, res) => {
    const token = req.token;
    // console.log(token);
    await logout(token);
    res.status(204).end();
})

module.exports = authController;