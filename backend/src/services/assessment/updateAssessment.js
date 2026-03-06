const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, ASSESSMENT_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const updateAssessment = async (assessmentId, updateData, supervisorId) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Assessment not found");

    if (assessment.supervisorId !== supervisorId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only update your own assessments",
      );
    }

    if (
      assessment.status === ASSESSMENT_STATUS.COMPLETED ||
      assessment.status === ASSESSMENT_STATUS.SUBMITTED
    ) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Cannot update assessment because it is currently ${assessment.status.toLowerCase()}`,
      );
    }

    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        technical:
          updateData.technical !== undefined
            ? updateData.technical
            : assessment.technical,
        communication:
          updateData.communication !== undefined
            ? updateData.communication
            : assessment.communication,
        punctuality:
          updateData.punctuality !== undefined
            ? updateData.punctuality
            : assessment.punctuality,
        initiative:
          updateData.initiative !== undefined
            ? updateData.initiative
            : assessment.initiative,
        teamwork:
          updateData.teamwork !== undefined
            ? updateData.teamwork
            : assessment.teamwork,
        professionalism:
          updateData.professionalism !== undefined
            ? updateData.professionalism
            : assessment.professionalism,
        problemSolving:
          updateData.problemSolving !== undefined
            ? updateData.problemSolving
            : assessment.problemSolving,
        adaptability:
          updateData.adaptability !== undefined
            ? updateData.adaptability
            : assessment.adaptability,
        strengths: updateData.strengths || assessment.strengths,
        areasForImprovement:
          updateData.areasForImprovement || assessment.areasForImprovement,
        comment: updateData.comment || assessment.comment,
        recommendation: updateData.recommendation || assessment.recommendation,
      },
      include: {
        student: { include: { user: true } },
        supervisor: { include: { user: true } },
      },
    });

    logger.info(`Assessment updated: ${assessmentId}`);
    return updated;
  } catch (error) {
    logger.error(`Error updating assessment: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { updateAssessment };
