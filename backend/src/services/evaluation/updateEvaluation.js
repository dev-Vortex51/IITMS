const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { calculateAverageScore, calculateGrade } = require("./helpers");

const prisma = getPrismaClient();

const updateEvaluation = async (id, evaluationData, supervisorId) => {
  try {
    const existingEvaluation = await prisma.evaluation.findUnique({
      where: { id },
      select: { id: true, supervisorId: true, status: true },
    });

    if (!existingEvaluation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Evaluation not found");
    }

    if (existingEvaluation.supervisorId !== supervisorId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only update your own evaluations",
      );
    }

    if (existingEvaluation.status === "completed") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Completed evaluation cannot be updated",
      );
    }

    const updateData = {};
    if (evaluationData.type) {
      updateData.type = evaluationData.type;
    }
    if (evaluationData.strengths !== undefined) {
      updateData.strengths = evaluationData.strengths || null;
    }
    if (evaluationData.areasForImprovement !== undefined) {
      updateData.areasForImprovement = evaluationData.areasForImprovement || null;
    }
    if (evaluationData.comment !== undefined) {
      updateData.comment = evaluationData.comment || null;
    }

    if (evaluationData.scores) {
      updateData.technicalSkill = evaluationData.scores.technicalSkill;
      updateData.communication = evaluationData.scores.communication;
      updateData.professionalism = evaluationData.scores.professionalism;
      updateData.punctuality = evaluationData.scores.punctuality;
      updateData.problemSolving = evaluationData.scores.problemSolving;
      updateData.workAttitude = evaluationData.scores.workAttitude || null;
      updateData.initiative = evaluationData.scores.initiative || null;
      const totalScore = calculateAverageScore(evaluationData.scores);
      updateData.totalScore = totalScore;
      updateData.grade = calculateGrade(totalScore);
    }

    if (evaluationData.status) {
      updateData.status = evaluationData.status;
      if (evaluationData.status === "submitted") {
        updateData.submittedAt = new Date();
      }
      if (evaluationData.status === "completed") {
        updateData.completedAt = new Date();
      }
    }

    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        supervisor: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    return evaluation;
  } catch (error) {
    logger.error(`Error updating evaluation: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { updateEvaluation };
