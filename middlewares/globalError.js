const AppError = require("../util/appError");

// Cast errors sent from mongoose - function
function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

// handling errors that comes from mondoDB with the same unique identifier
function handleDuplicataDB(err) {
  const [errorInfo] = Object.entries(err.keyValue);
  const value = errorInfo[1];
  const message = `Duplicate field: ${value}. Please try another value`;
  return new AppError(message, 400);
}

// handling validation errors for mode prod - function
function handleValidationErrorDB(err) {
  console.log(err.errors);
  const values = Object.values(err.errors).map((value) => value.message);
  const message = `Invalid input data: ${values.join("\n")}`;
  return new AppError(message, 400);
}

// handle express-validator error
function handleExpressValidatorErrorDB(err) {
  const values = err.map((e) => e.message).join("\n");
  const message = `Invalid data: ${values}`;
  return new AppError(message, 400);
}

// handle jwt error - works only in prod mode
function handleJsonWebTokenError() {
  return new AppError("Invalid token. Please log in again!", 401);
}

// handle JsonWToken Expired Error;
function handleJsonExpiredError() {
  return new AppError("Expired token. Please log in again!", 401);
}

// Errors to be displayed when in dev mode - function
function sendErrorDev(err, res) {
  console.log(err);
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
    res.status(err.statusCode).json({
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

module.exports = (err, req, res, next) => {
  console.log(err);
  // defining a default error, because there will be errors that are not comming from us, there is going to be errors without a status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    } else if (error.code === 11000) {
      error = handleDuplicataDB(error);
    } else if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    } else if (Array.isArray(err)) {
      error = handleExpressValidatorErrorDB(err);
    } else if (error.name === "JsonWebTokenError") {
      error = handleJsonWebTokenError();
    } else if(error.name === "TokenExpiredError") {
      error = handleJsonExpiredError();
    } else {
      error = err;
    }
    sendErrorProd(error, res);
  }
};

// Different error messages for the production and dev environments
// in production we want to leak as little information about our errors to the client as possible
// in dev we want to know as much info about the error as possible
