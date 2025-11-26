const SystemSettings = require("../models/SystemSettings");
const NotificationPreference = require("../models/NotificationPreference");
const asyncHandler = require("express-async-handler");
const { ApiError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

/**
 * @desc    Get system settings
 * @route   GET /api/v1/settings/system
 * @access  Admin
 */
const getSystemSettings = asyncHandler(async (req, res) => {
  let settings = await SystemSettings.findOne();

  // Create default settings if none exist
  if (!settings) {
    settings = await SystemSettings.create({
      currentSession: "2024/2025",
      semester: "First Semester",
      siweDuration: 6,
      minWeeks: 24,
      autoAssignSupervisors: false,
      requireLogbookApproval: true,
    });
    logger.info("Created default system settings");
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
});

/**
 * @desc    Update system settings
 * @route   PUT /api/v1/settings/system
 * @access  Admin
 */
const updateSystemSettings = asyncHandler(async (req, res) => {
  const {
    currentSession,
    semester,
    siweDuration,
    minWeeks,
    autoAssignSupervisors,
    requireLogbookApproval,
  } = req.body;

  let settings = await SystemSettings.findOne();

  if (!settings) {
    // Create if doesn't exist
    settings = await SystemSettings.create(req.body);
  } else {
    // Update existing
    if (currentSession !== undefined) settings.currentSession = currentSession;
    if (semester !== undefined) settings.semester = semester;
    if (siweDuration !== undefined) settings.siweDuration = siweDuration;
    if (minWeeks !== undefined) settings.minWeeks = minWeeks;
    if (autoAssignSupervisors !== undefined)
      settings.autoAssignSupervisors = autoAssignSupervisors;
    if (requireLogbookApproval !== undefined)
      settings.requireLogbookApproval = requireLogbookApproval;

    await settings.save();
  }

  logger.info(`System settings updated by admin ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: "System settings updated successfully",
    data: settings,
  });
});

/**
 * @desc    Get notification preferences
 * @route   GET /api/v1/settings/notifications
 * @access  Private
 */
const getNotificationPreferences = asyncHandler(async (req, res) => {
  let preferences = await NotificationPreference.findOne({
    user: req.user._id,
  });

  // Create default preferences if none exist
  if (!preferences) {
    preferences = await NotificationPreference.create({
      user: req.user._id,
      emailNotifications: false,
      placementAlerts: false,
      systemUpdates: false,
    });
  }

  res.status(200).json({
    success: true,
    data: preferences,
  });
});

/**
 * @desc    Update notification preferences
 * @route   PUT /api/v1/settings/notifications
 * @access  Private
 */
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { emailNotifications, placementAlerts, systemUpdates } = req.body;

  let preferences = await NotificationPreference.findOne({
    user: req.user._id,
  });

  if (!preferences) {
    // Create if doesn't exist
    preferences = await NotificationPreference.create({
      user: req.user._id,
      ...req.body,
    });
  } else {
    // Update existing
    if (emailNotifications !== undefined)
      preferences.emailNotifications = emailNotifications;
    if (placementAlerts !== undefined)
      preferences.placementAlerts = placementAlerts;
    if (systemUpdates !== undefined) preferences.systemUpdates = systemUpdates;

    await preferences.save();
  }

  logger.info(`Notification preferences updated by user ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: "Notification preferences updated successfully",
    data: preferences,
  });
});

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
};
