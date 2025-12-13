/**
 * Authentication Service
 * Handles authentication business logic
 * Login, password reset, and token management
 */

const { User, Student, Supervisor } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../utils/constants");
const { generateToken, generateRefreshToken } = require("../middleware/auth");
const config = require("../config");
const logger = require("../utils/logger");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User and tokens
 */
const login = async (email, password) => {
  // Find user with password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGES.INVALID_CREDENTIALS
    );
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "Account has been deactivated");
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGES.INVALID_CREDENTIALS
    );
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  // Generate tokens
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Get additional profile data based on role
  let profileData = null;
  if (user.role === "student") {
    profileData = await Student.findOne({ user: user._id });
  } else if (
    ["academic_supervisor", "industrial_supervisor"].includes(user.role)
  ) {
    profileData = await Supervisor.findOne({ user: user._id });
  }

  logger.info(`User logged in: ${user.email}`);

  return {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      profileData,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Change password
 * @param {ObjectId} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  // Verify old password
  const isPasswordValid = await user.comparePassword(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Current password is incorrect"
    );
  }

  // Check if new password is same as old
  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "New password must be different from current password"
    );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`User changed password: ${user.email}`);

  return {
    message: SUCCESS_MESSAGES.PASSWORD_RESET,
  };
};

/**
 * Logout user (can be used to invalidate tokens in future with token blacklist)
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} Success message
 */
const logout = async (userId) => {
  // In a more advanced implementation, we would add the token to a blacklist
  // For now, client-side token removal is sufficient

  logger.info(`User logged out: ${userId}`);

  return {
    message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
  };
};

/**
 * Get user profile
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} User profile
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  // Get additional profile data based on role
  let profileData = null;
  if (user.role === "student") {
    profileData = await Student.findOne({ user: user._id })
      .populate("department")
      .populate("currentPlacement")
      .populate("departmentalSupervisor")
      .populate("industrialSupervisor");
  } else if (
    ["academic_supervisor", "industrial_supervisor"].includes(user.role)
  ) {
    profileData = await Supervisor.findOne({ user: user._id })
      .populate("department")
      .populate("assignedStudents");
  }

  return {
    ...user.toJSON(),
    profileData,
  };
};

/**
 * Update user profile
 * @param {ObjectId} userId - User ID
 * @param {Object} updateData - Profile update data
 * @returns {Promise<Object>} Updated user
 */
const updateProfile = async (userId, updateData) => {
  const allowedFields = ["firstName", "lastName", "phone", "address", "bio"];
  const filteredData = {};

  // Filter allowed fields
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  logger.info(`User updated profile: ${user.email}`);

  return user;
};

/**
 * Forgot Password - send reset link
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return; // Don't reveal if user exists

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = token;
  user.passwordResetExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  // Send email
  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/reset-password?token=${token}`;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    secure: false,
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset for your SIWES account.</p>
      <p>Click <a href='${resetUrl}'>here</a> to reset your password. This link is valid for 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>`,
  });
};

/**
 * Reset Password with token
 */
const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password");
  if (!user)
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid or expired reset token"
    );
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return { email: user.email };
};

/**
 * Reset Password on first login
 * @param {ObjectId} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
const resetPasswordFirstLogin = async (userId, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  // Update password and clear first login flag
  user.password = newPassword;
  user.isFirstLogin = false;
  await user.save();

  logger.info(`User reset password on first login: ${user.email}`);

  return { email: user.email };
};

module.exports = {
  login,
  changePassword,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  resetPasswordFirstLogin,
};
