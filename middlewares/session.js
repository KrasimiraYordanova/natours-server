const { verifyToken } = require("../services/userService");

module.exports = () => (req, res, next) => {
    // extracting the token out of the headers
    const token = req.headers['x-authorization'];
    // if there is a token need to verify it
    if(token) {
        // if there is no error we verify it and extract the user cridentails and his token
        try {
            const payload = verifyToken(token);
            req.user = payload;
            req.token = token;
        } catch(err) {
            return res.status(401).json({ message: 'Invalid authorization token'});
        }
    }

    next();
}