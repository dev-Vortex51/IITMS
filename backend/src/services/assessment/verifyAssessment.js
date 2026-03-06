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
const { calculateScore, calculateGrade } = require("./helpers");

const prisma = getPrismaClient();

const verifyAssessment = async (assessmentId, coordinatorId, comment = "") => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { student: true },
    });

    if (!assessment)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Assessment not found");
    if (assessment.status !== ASSESSMENT_STATUS.SUBMITTED) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Assessment must be submitted before verification",
      );
    }

    const score = calculateScore(assessment);
    const grade = calculateGrade(score);

    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: ASSESSMENT_STATUS.COMPLETED,
        completedAt: new Date(),
        verifiedById: coordinatorId,
        verifiedAt: new Date(),
        verificationNote: comment,
        grade,
      },
      include: {
        student: { include: { user: true } },
        supervisor: { include: { user: true } },
      },
    });

    try {
      await notificationService.createNotification({
        recipient: assessment.student.userId,
        type: NOTIFICATION_TYPES.ASSESSMENT_REVIEWED,
        title: "Assessment Verified",
        message: `Your ${assessment.type} assessment has been verified. Grade: ${grade}`,
        priority: "high",
        relatedModel: "Assessment",
        relatedId: assessmentId,
      });
    } catch (notifError) {
      logger.error(
        `Non-fatal: Failed to send verification notification: ${notifError.message}`,
      );
    }

    logger.info(`Assessment verified: ${assessmentId}`);
    return updated;
  } catch (error) {
    logger.error(`Error verifying assessment: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { verifyAssessment };
