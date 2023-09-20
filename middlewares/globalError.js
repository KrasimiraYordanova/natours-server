const AppError = require("../util/appError");

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  // defining a default error, because there will be errors that are not comming from us, there is going to be errors without a status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });

  // Cast errors sent from mongoose - function
  function handleCastErrorDB(err) {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
  }

  // handling errors that comes from mondoDB with the same unique identifier
  function handleDuplicataDB(err) {
    const value = err.errmsg.match(/["'](\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please try another value`;
    return new AppError(message, 400);
  }

  // handling validation errors for mode prod - function
  function handleValidationErrorDB(err) {
    const values = Object.values(err.errors).map(value => value.message).join('\n');
    const message = `Invalid input data: ${values}`;;
    return new AppError(message, 400);
  }

  // Errors to be displayed when in dev mode - function
  function sendErrorDev(err, res) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Errors to be displayed when in prod mode - function
  function sendErrorProd(err, res) {
    if (err.isOperational) {
      res.status(res.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // 1. Log error
      console.error("error ", err);

      // 2. Send generic message
      res.status(500).json({
        status: "err",
        message: "Something went wrong!",
      });
    }
  }

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (error.name == "CastError") {
      error = handleCastErrorDB(error);
    } 
    if (error.code == 11000) {
      error = handleDuplicataDB(error);
    }
    if (error.name == "ValidationError") {
      error = handleValidationErrorDB(error);
    }
    sendErrorProd(error, res);
  }
};
