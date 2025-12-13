/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 * Protects routes that require authentication
 */

const jwt = require("jsonwebtoken");
const { User } = require("../models");
const config = require("../config");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../utils/constants");
const { formatResponse } = require("../utils/helpers");
const logger = require("../utils/logger");

/**
 * Verify JWT token and authenticate user
 * Attaches authenticated user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(formatResponse(false, ERROR_MESSAGES.UNAUTHORIZED));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      logger.warn(`Invalid token attempt: ${error.message}`);
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(formatResponse(false, ERROR_MESSAGES.INVALID_TOKEN));
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id).select("+password");

    if (!user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(formatResponse(false, "User not found or has been deleted"));
    }

    // Check if user is active
    if (!user.isActive) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(formatResponse(false, "Account has been deactivated"));
    }

    // Populate student/supervisor profile if applicable
    const { Student, Supervisor } = require("../models");
    const { ROLES } = require("../utils/constants");

    if (user.role === ROLES.STUDENT) {
      const studentProfile = await Student.findOne({ user: user._id });
      if (studentProfile) {
        user.studentProfile = studentProfile._id;
      }
    } else if (
      [ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR].includes(
        user.role
      )
    ) {
      const supervisorProfile = await Supervisor.findOne({ user: user._id });
      if (supervisorProfile) {
        user.supervisorProfile = supervisorProfile._id;
        user.supervisorType = supervisorProfile.type;
      }
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(formatResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Optional authentication
 * Does not fail if no token provided, but verifies if present
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Invalid token, but continue anyway
      logger.debug(`Optional auth failed: ${error.message}`);
    }

    next();
  } catch (error) {
    logger.error(`Optional auth error: ${error.message}`);
    next();
  }
};

/**
 * Check if password reset is NOT required
 * Used for routes that should only be accessible after password reset
 */
const requirePasswordReset = (req, res, next) => {
  if (!req.user) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(formatResponse(false, ERROR_MESSAGES.UNAUTHORIZED));
  }

  if (!req.user.isFirstLogin && !req.user.passwordResetRequired) {
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json(
        formatResponse(false, "Password has already been reset. Please login.")
      );
  }

  next();
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    type: "refresh",
  };

  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  });
};

/**
 * Verify refresh token and generate new access token
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(formatResponse(false, "Refresh token is required"));
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (error) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(formatResponse(false, "Invalid or expired refresh token"));
    }

    if (decoded.type !== "refresh") {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(formatResponse(false, "Invalid token type"));
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(formatResponse(false, "User not found or inactive"));
    }

    // Generate new access token
    const accessToken = generateToken(user);

    res.status(HTTP_STATUS.OK).json(
      formatResponse(true, "Token refreshed successfully", {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      })
    );
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(formatResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  requirePasswordReset,
  generateToken,
  generateRefreshToken,
  refreshAccessToken,
};
