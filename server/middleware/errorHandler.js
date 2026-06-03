const AppError = require('../utils/customError');
const logger = require('../utils/logger');

/**
 * Handle Mongoose CastError (e.g. invalid ObjectId format)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Duplicate Fields Error (e.g. unique constraint violation)
 */
const handleDuplicateFieldsDB = (err) => {
  // Extract duplicate value from Mongo error message (usually between quotes)
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : '';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose ValidationErrors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

/**
 * Send detailed error response in Development environment
 */
const sendErrorDev = (err, res) => {
  logger.error(`[Dev Error]: ${err.message}`, {
    stack: err.stack,
    error: err,
  });

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

/**
 * Send sanitized, client-friendly error response in Production environment
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    logger.warn(`[Prod Operational Error]: ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Programmatic or other unknown error: don't leak details to client
  logger.error(`[Prod Programmatic/Critical Error]: ${err.message}`, {
    stack: err.stack,
    error: err,
  });

  return res.status(500).json({
    success: false,
    message: 'Something went very wrong on our end!',
  });
};

/**
 * Global Express Error Handling Middleware
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Categorize and translate common third-party/database errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
