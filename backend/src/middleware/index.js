const auth = require("./auth");
const authorization = require("./authorization");
const validation = require("./validation");
const errorHandler = require("./errorHandler");
const security = require("./security");
const cache = require("./cache");

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

  // Cache
  ...cache,
};
