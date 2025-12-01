/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

const { authService } = require("../services");
const { asyncHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS, SUCCESS_MESSAGES } = require("../utils/constants");
const { formatResponse } = require("../utils/helpers");

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  // If password reset required
  if (result.requiresPasswordReset) {
    return res
      .status(HTTP_STATUS.OK)
      .json(formatResponse(true, "Password reset required", result));
  }

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, SUCCESS_MESSAGES.LOGIN_SUCCESS, result));
});

/**
 * @route   POST /api/v1/auth/reset-password-first-login
 * @desc    Reset password on first login
 * @access  Public (with temp token)
 */
const resetPasswordFirstLogin = asyncHandler(async (req, res) => {
  console.log("Reset password request body:", req.body);
  const { userId, newPassword } = req.body;
  console.log("Extracted userId:", userId, "newPassword:", newPassword);

  const result = await authService.resetPasswordFirstLogin(userId, newPassword);

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(true, "Password reset successful. Please login.", result)
    );
});

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await authService.changePassword(req.user._id, oldPassword, newPassword);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, SUCCESS_MESSAGES.PASSWORD_RESET));
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, SUCCESS_MESSAGES.LOGOUT_SUCCESS));
});

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Profile retrieved successfully", profile));
});

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Profile updated successfully", user));
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "User retrieved successfully", req.user));
});

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset link to email
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "If an account with that email exists, a reset link has been sent."
      )
    );
});

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(true, "Password reset successful. You can now log in.")
    );
});

module.exports = {
  login,
  resetPasswordFirstLogin,
  changePassword,
  logout,
  getProfile,
  updateProfile,
  getMe,
  forgotPassword,
  resetPassword,
};
