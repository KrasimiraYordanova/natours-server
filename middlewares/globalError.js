module.exports = (err, req, res, next) => {
    // console.log(err.stack);
    // defining a default error, because there will be errors that are not comming from us, there is going to be errors without a status code
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
  
    res.status(err.statusCode).json({ status: err.status, message: err.message });
  };