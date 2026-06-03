/**
 * @class AppError
 * @extends Error
 * @description Custom operational error class to handle API-specific errors.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Status is 'fail' for 4xx errors, and 'error' for 5xx errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Operational error flag: distinguishes operational errors from programming bugs
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
