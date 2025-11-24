/**
 * Validation Middleware
 * Validates request data using Joi schemas
 * Returns formatted error responses for validation failures
 */

const { HTTP_STATUS } = require("../utils/constants");
const { formatResponse } = require("../utils/helpers");
const logger = require("../utils/logger");

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Middleware function
 */
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      logger.debug(`Validation error: ${JSON.stringify(errors)}`);

      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .json(formatResponse(false, "Validation error", { errors }));
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

/**
 * Validate request body
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Middleware function
 */
const validateBody = (schema) => validate(schema, "body");

/**
 * Validate query parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Middleware function
 */
const validateQuery = (schema) => validate(schema, "query");

/**
 * Validate URL parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Middleware function
 */
const validateParams = (schema) => validate(schema, "params");

/**
 * Validate MongoDB ObjectId in params
 */
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;

    if (!objectIdPattern.test(id)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(formatResponse(false, `Invalid ${paramName} format`));
    }

    next();
  };
};

/**
 * Sanitize string inputs to prevent XSS
 * Applied automatically to all string fields in body
 */
const sanitize = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        // Basic XSS prevention
        obj[key] = obj[key]
          .replace(/<script[^>]*>.*?<\/script>/gi, "")
          .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body);
  }

  next();
};

/**
 * Prevent NoSQL injection
 * Checks for MongoDB operators in user input
 */
const preventNoSQLInjection = (req, res, next) => {
  const checkObject = (obj) => {
    for (const key in obj) {
      // Check for MongoDB operators
      if (key.startsWith("$")) {
        return true;
      }

      // Check for regex patterns that might be malicious
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (obj[key].$regex || obj[key].$where) {
          return true;
        }
        if (checkObject(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  const suspicious = [
    req.body && checkObject(req.body),
    req.query && checkObject(req.query),
    req.params && checkObject(req.params),
  ].some(Boolean);

  if (suspicious) {
    logger.warn(`NoSQL injection attempt detected from IP: ${req.ip}`);
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(formatResponse(false, "Invalid request format"));
  }

  next();
};

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateObjectId,
  sanitize,
  preventNoSQLInjection,
};
