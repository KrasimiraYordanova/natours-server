// need the appError to inherit from the built-in error
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // We also need to capture stack trace - the big, fat error message; and exclude this class from the rror stack(not to appear)
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;