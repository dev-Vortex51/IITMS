/**
 * Express Application Configuration
 * Main application setup with middleware and route mounting
 */

const express = require("express");
const morgan = require("morgan");
const compression = require("compression");
const config = require("./config");
const routes = require("./routes");
const {
  helmetConfig,
  corsOptions,
  generalLimiter,
  suspiciousActivityCheck,
  ipFilter,
  requestLogger,
  preventParameterPollution,
  sanitize,
  preventNoSQLInjection,
  errorHandler,
  notFound,
} = require("./middleware");
const logger = require("./utils/logger");

/**
 * Create Express application
 */
const app = express();

/**
 * Security Middleware
 */
app.use(helmetConfig); // Security headers
app.use(corsOptions); // CORS configuration
app.use(ipFilter); // IP filtering
app.use(suspiciousActivityCheck); // Check for suspicious patterns

/**
 * Request Processing Middleware
 */
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies
app.use(compression()); // Compress responses
app.use(preventParameterPollution); // Prevent parameter pollution
app.use(sanitize); // Sanitize inputs
app.use(preventNoSQLInjection); // Prevent NoSQL injection

/**
 * Logging Middleware
 */
if (config.isDevelopment) {
  app.use(morgan("dev")); // Development logging
} else {
  app.use(morgan("combined", { stream: logger.stream })); // Production logging
}
app.use(requestLogger); // Custom request logger

/**
 * Rate Limiting
 */
app.use(generalLimiter);

/**
 * API Routes
 */
app.use(`/api/${config.apiVersion}`, routes);

/**
 * Root endpoint
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SIWES Management System API",
    version: config.apiVersion,
    documentation: `/api/${config.apiVersion}`,
    status: "operational",
  });
});

/**
 * 404 Handler
 * Must be placed after all routes
 */
app.use(notFound);

/**
 * Error Handler
 * Must be the last middleware
 */
app.use(errorHandler);

module.exports = app;
