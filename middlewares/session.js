const { verifyToken } = require("../services/authService");
const { catchAsync } = require("./catchAsync");

module.exports = () =>
  catchAsync(async (req, res, next) => {
    // extracting the token out of the headers
    const headers = req.headers;
    const token = req.headers["x-authorization"];
    const cookie = req.headers.cookie;
    console.log(headers);
    // if there is a token need to verify it
    if (token) {
      // if there is no error we verify it and extract the user cridentails and his token
      const payload = verifyToken(token);
      req.user = payload;
      req.token = token;
    }
    next();
  });