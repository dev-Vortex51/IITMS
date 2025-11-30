/**
 * Environment Configuration Module
 * Loads and validates environment variables for the application
 * Ensures all required configuration is present before app starts
 */

const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Configuration object containing all environment variables
 * Organized by concern for maintainability
 */
const config = {
  // Environment
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  isTest: process.env.NODE_ENV === "test",

  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || "v1",

  // Database
  database: {
    uri:
      process.env.NODE_ENV === "test"
        ? process.env.MONGODB_URI_TEST
        : process.env.MONGODB_URI ||
          "mongodb://localhost:27017/siwes_management",
    options: {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 0, // No timeout
      connectTimeoutMS: 30000,
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "fallback_secret_change_in_production",
    expire: process.env.JWT_EXPIRE || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || "30d",
  },

  // Password
  password: {
    default: process.env.DEFAULT_PASSWORD || "Change@123",
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || "SIWES Management <noreply@siwes.edu>",
  },

  // CORS
  cors: {
    origins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:5173"],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    path: process.env.UPLOAD_PATH || "./uploads",
    allowedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
  },

  // Pagination
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100,
  },
};

/**
 * Validates required environment variables
 * Throws error if critical configuration is missing
 */
const validateConfig = () => {
  const required = ["MONGODB_URI", "JWT_SECRET"];
  const missing = [];

  required.forEach((key) => {
    if (!process.env[key] && config.env !== "test") {
      missing.push(key);
    }
  });

  if (missing.length > 0 && config.env === "production") {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (config.env === "production" && config.jwt.secret.includes("fallback")) {
    console.warn(
      "WARNING: Using fallback JWT secret in production! Please set JWT_SECRET."
    );
  }
};

// Validate configuration on module load
if (config.env !== "test") {
  validateConfig();
}

module.exports = config;
