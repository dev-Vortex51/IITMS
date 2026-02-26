const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS } = require("../utils/constants");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

/**
 * Get system settings - retrieve or create defaults
 */
const getSystemSettings = async () => {
  try {
    let settings = await prisma.systemSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          currentSession: "2024/2025",
          semester: "First Semester",
          siweDuration: 6,
          minWeeks: 24,
          autoAssignSupervisors: false,
          requireLogbookApproval: true,
        },
      });
      logger.info("Created default system settings");
    }

    return settings;
  } catch (error) {
    const prismaError = handlePrismaError(error);
    logger.error("Error retrieving system settings:", prismaError);
    throw prismaError;
  }
};

/**
 * Update system settings
 */
const updateSystemSettings = async (updateData, userId) => {
  try {
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.systemSettings.create({
        data: updateData,
      });
    } else {
      // Update existing
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    logger.info(`System settings updated by user ${userId}`);

    return settings;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    logger.error("Error updating system settings:", prismaError);
    throw prismaError;
  }
};

/**
 * Get notification preferences for a user - retrieve or create defaults
 */
const getNotificationPreferences = async (userId) => {
  try {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          emailNotifications: false,
          placementAlerts: false,
          systemUpdates: false,
        },
      });
    }

    return preferences;
  } catch (error) {
    const prismaError = handlePrismaError(error);
    logger.error("Error retrieving notification preferences:", prismaError);
    throw prismaError;
  }
};

/**
 * Update notification preferences for a user
 */
const updateNotificationPreferences = async (userId, updateData) => {
  try {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create if doesn't exist
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          ...updateData,
        },
      });
    } else {
      // Update existing
      preferences = await prisma.notificationPreference.update({
        where: { userId },
        data: updateData,
      });
    }

    logger.info(`Notification preferences updated by user ${userId}`);

    return preferences;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    logger.error("Error updating notification preferences:", prismaError);
    throw prismaError;
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
};
