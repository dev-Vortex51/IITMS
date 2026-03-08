const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS } = require("../utils/constants");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

const normalizeSystemSettingsUpdate = (updateData = {}) => {
  const normalized = { ...updateData };

  const numericFields = [
    "siweDuration",
    "minWeeks",
    "systemScoreMax",
    "defenseScoreMax",
    "logbookWeight",
    "evaluationWeight",
    "assessmentWeight",
    "visitationWeight",
    "maxVisitations",
  ];

  numericFields.forEach((field) => {
    if (normalized[field] === undefined) return;
    const value = Number(normalized[field]);
    if (!Number.isFinite(value) || value < 0) {
      delete normalized[field];
      return;
    }
    normalized[field] = Math.round(value);
  });

  if (
    normalized.systemScoreMax !== undefined &&
    normalized.defenseScoreMax !== undefined &&
    normalized.systemScoreMax + normalized.defenseScoreMax !== 100
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "System score max and defense score max must sum to 100",
    );
  }

  if (
    normalized.systemScoreMax !== undefined &&
    normalized.systemScoreMax <= 0
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "System score max must be greater than 0",
    );
  }

  if (
    normalized.maxVisitations !== undefined &&
    normalized.maxVisitations <= 0
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Maximum visitations must be greater than 0",
    );
  }

  return normalized;
};

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
          systemScoreMax: 80,
          defenseScoreMax: 20,
          logbookWeight: 20,
          evaluationWeight: 20,
          assessmentWeight: 30,
          visitationWeight: 10,
          maxVisitations: 2,
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
    const normalizedUpdateData = normalizeSystemSettingsUpdate(updateData);

    let settings = await prisma.systemSettings.findFirst();

    const currentSystemScoreMax = settings?.systemScoreMax ?? 80;
    const currentDefenseScoreMax = settings?.defenseScoreMax ?? 20;
    const nextSystemScoreMax =
      normalizedUpdateData.systemScoreMax ?? currentSystemScoreMax;
    const nextDefenseScoreMax =
      normalizedUpdateData.defenseScoreMax ?? currentDefenseScoreMax;

    if (nextSystemScoreMax + nextDefenseScoreMax !== 100) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "System score max and defense score max must sum to 100",
      );
    }

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.systemSettings.create({
        data: normalizedUpdateData,
      });
    } else {
      // Update existing
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: normalizedUpdateData,
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
