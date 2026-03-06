const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const {
  HTTP_STATUS,
  ASSESSMENT_STATUS,
  NOTIFICATION_TYPES,
} = require("../../utils/constants");
const logger = require("../../utils/logger");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const submitAssessment = async (assessmentId, supervisorId) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { student: true },
    });

    if (!assessment)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Assessment not found");
    if (assessment.supervisorId !== supervisorId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only submit your own assessments",
      );
    }
    if (assessment.status === ASSESSMENT_STATUS.SUBMITTED) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Assessment already submitted",
      );
    }

    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: ASSESSMENT_STATUS.SUBMITTED,
        submittedAt: new Date(),
      },
      include: {
        student: { include: { user: true } },
        supervisor: { include: { user: true } },
      },
    });

    try {
      await notificationService.createNotification({
        recipient: assessment.student.userId,
        type: NOTIFICATION_TYPES.ASSESSMENT_SUBMITTED || "assessment_submitted",
        title: "Assessment Submitted",
        message: `Your ${assessment.type} assessment has been submitted`,
        priority: "high",
        relatedModel: "Assessment",
        relatedId: assessmentId,
      });
    } catch (notifError) {
      logger.error(
        `Non-fatal: Failed to send submission notification: ${notifError.message}`,
      );
    }

    logger.info(`Assessment submitted: ${assessmentId}`);
    return updated;
  } catch (error) {
    logger.error(`Error submitting assessment: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { submitAssessment };
