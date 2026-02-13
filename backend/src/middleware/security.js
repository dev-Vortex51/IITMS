const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const config = require("../config");
const { HTTP_STATUS } = require("../utils/constants");
const { formatResponse } = require("../utils/helpers");
const logger = require("../utils/logger");
const { roleLimits } = require("./authorization");

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (config.cors.origins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: formatResponse(false, "Too many requests, please try again later"),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === "/health" || req.path === "/api/health";
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  skipSuccessfulRequests: true,
  message: formatResponse(
    false,
    "Too many login attempts, please try again after 15 minutes",
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

const roleBasedLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: async (req) => {
    if (req.user && req.user.role) {
      return roleLimits[req.user.role] || 100;
    }
    return 50; // Default for unauthenticated requests
  },
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
  message: formatResponse(false, "Rate limit exceeded"),
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: formatResponse(
    false,
    "Upload limit exceeded, please try again later",
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

const suspiciousActivityCheck = (req, res, next) => {
  const suspiciousPatterns = [
    /(\.\.)|(\/\/)/g, // Path traversal
    /<script/gi, // XSS attempts
    /union.*select/gi, // SQL injection (just in case)
    /exec\s*\(/gi, // Code execution attempts
  ];

  const checkString = `${req.url}${JSON.stringify(req.body)}${JSON.stringify(
    req.query,
  )}`;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      logger.warn(`Suspicious activity detected from IP ${req.ip}: ${req.url}`);
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(formatResponse(false, "Suspicious activity detected"));
    }
  }

  next();
};

const ipFilter = (req, res, next) => {
  const blockedIPs = process.env.BLOCKED_IPS
    ? process.env.BLOCKED_IPS.split(",")
    : [];

  if (blockedIPs.includes(req.ip)) {
    logger.warn(`Blocked IP attempted access: ${req.ip}`);
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json(formatResponse(false, "Access denied"));
  }

  next();
};

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      user: req.user ? req.user.email : "anonymous",
    });
  });

  next();
};

const preventParameterPollution = (req, res, next) => {
  // Whitelist of parameters that can be arrays
  const whitelist = ["sort", "fields", "filter", "status"];

  for (const key in req.query) {
    if (Array.isArray(req.query[key]) && !whitelist.includes(key)) {
      req.query[key] = req.query[key][req.query[key].length - 1];
    }
  }

  next();
};

module.exports = {
  helmetConfig,
  corsOptions: cors(corsOptions),
  generalLimiter,
  authLimiter,
  roleBasedLimiter,
  uploadLimiter,
  suspiciousActivityCheck,
  ipFilter,
  requestLogger,
  preventParameterPollution,
};
