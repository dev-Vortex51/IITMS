const { settingsService } = require("../services");
const { asyncHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS } = require("../utils/constants");
const { formatResponse } = require("../utils/helpers");
const logger = require("../utils/logger");

const getSystemSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSystemSettings();

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(true, "System settings retrieved successfully", settings),
    );
});

const updateSystemSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSystemSettings(
    req.body,
    req.user.id,
  );

  logger.info(`System settings updated by user ${req.user.id}`);

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(true, "System settings updated successfully", settings),
    );
});

const getNotificationPreferences = asyncHandler(async (req, res) => {
  const preferences = await settingsService.getNotificationPreferences(
    req.user.id,
  );

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Notification preferences retrieved successfully",
        preferences,
      ),
    );
});

const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const preferences = await settingsService.updateNotificationPreferences(
    req.user.id,
    req.body,
  );

  logger.info(`Notification preferences updated by user ${req.user.id}`);

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Notification preferences updated successfully",
        preferences,
      ),
    );
});

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
};
