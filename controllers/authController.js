const { register } = require('../services/userService');

const authController = require('express').Router();

authController.post('/register', async(req, res) => {
    try {
        // on register - registering the user and returning the object with token and user info
        if(req.body.password != req.body.repassword) {
            throw new Error('Passwords does not match');
        }
        const token = await register(req.body.email, req.body.password);
        res.status(200).json(token);
    } catch(err) {
        // on error - sending status code with the error message
        res.status(400).json({ message: err.message });
    }
})

module.exports = authController;