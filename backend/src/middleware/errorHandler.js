/**
 * Error Handling Middleware
 * Centralized error handling for the entire application
 * Formats errors consistently and logs them appropriately
 */

const { HTTP_STATUS, ERROR_MESSAGES } = require("../utils/constants");
const { formatResponse } = require("../utils/helpers");
const logger = require("../utils/logger");
const config = require("../config");

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(HTTP_STATUS.BAD_REQUEST, message);
};

/**
 * Handle Mongoose Duplicate Key Error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists`;
  return new ApiError(HTTP_STATUS.CONFLICT, message);
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message);
};

/**
 * Handle JWT Error
 */
const handleJWTError = () => {
  return new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_TOKEN);
};

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () => {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    "Token has expired. Please login again."
  );
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json(
    formatResponse(false, err.message, {
      error: err,
      stack: err.stack,
    })
  );
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json(formatResponse(false, err.message));
  }
  // Programming or other unknown error: don't leak error details
  else {
    logger.error("ERROR 💥", err);

    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(formatResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Global error handling middleware
 * Must be placed after all routes
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.message = err.message || ERROR_MESSAGES.SERVER_ERROR;

  // Log error
  logger.error(`Error: ${err.message}`, {
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.email : "unauthenticated",
  });

  // Handle specific error types
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = handleCastError(err);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error = handleValidationError(err);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  }

  if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }

  // Send response based on environment
  if (config.isDevelopment) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Handle 404 Not Found errors
 */
const notFound = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.originalUrl} not found`
  );
  next(error);
};

/**
 * Async error wrapper
 * Catches errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle unhandled promise rejections
 */
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  logger.error(err.stack);

  if (config.isProduction) {
    process.exit(1);
  }
});

/**
 * Handle uncaught exceptions
 */
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  logger.error(err.stack);

  process.exit(1);
});

module.exports = {
  ApiError,
  errorHandler,
  notFound,
  asyncHandler,
};
