/**
 * Middleware Index
 * Central export point for all middleware
 */

const auth = require("./auth");
const authorization = require("./authorization");
const validation = require("./validation");
const errorHandler = require("./errorHandler");
const security = require("./security");

module.exports = {
  // Authentication
  ...auth,

  // Authorization
  ...authorization,

  // Validation
  ...validation,

  // Error Handling
  ...errorHandler,

  // Security
  ...security,
};
