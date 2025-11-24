/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const { authenticate, refreshAccessToken } = require("../middleware/auth");
const { validateBody } = require("../middleware/validation");
const { authValidation, userValidation } = require("../utils/validators");
const { authLimiter } = require("../middleware/security");

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  authLimiter,
  validateBody(authValidation.login),
  authController.login
);

/**
 * @route   POST /api/v1/auth/reset-password-first-login
 * @desc    Reset password on first login
 * @access  Public
 */
router.post(
  "/reset-password-first-login",
  validateBody(authValidation.resetPasswordFirstLogin),
  authController.resetPasswordFirstLogin
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
  "/change-password",
  authenticate,
  validateBody(authValidation.changePassword),
  authController.changePassword
);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh-token", refreshAccessToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticate, authController.getProfile);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  "/profile",
  authenticate,
  validateBody(userValidation.updateProfile),
  authController.updateProfile
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/me", authenticate, authController.getMe);

module.exports = router;
