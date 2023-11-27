const { verifyToken } = require("../services/authService");
const { catchAsync } = require("./catchAsync");

module.exports = () =>
  catchAsync(async (req, res, next) => {
    // extracting the token out of the headers
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    console.log('cookie');
    console.log(req.cookies.jwt);
    // if there is a token need to verify it
    if (token) {
      // if there is no error we verify it and extract the user cridentails and his token
      const payload = verifyToken(token);
      req.user = payload;
      req.token = token;
    }
    console.log(token);
    next();
  });