const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const {
  HTTP_STATUS,
  PLACEMENT_STATUS,
} = require("../../utils/constants");
const logger = require("../../utils/logger");
const { calculateSystemContinuousScore } = require("./systemScore");

const prisma = getPrismaClient();

const getStudentFinalGrade = async (studentId) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");

    const [settings, placement, logbooks, assessments, evaluations, visits] =
      await Promise.all([
        prisma.systemSettings.findFirst({
          select: {
            systemScoreMax: true,
            defenseScoreMax: true,
            logbookWeight: true,
            evaluationWeight: true,
            assessmentWeight: true,
            visitationWeight: true,
            maxVisitations: true,
          },
        }),
        prisma.placement.findFirst({
          where: { studentId, status: PLACEMENT_STATUS.APPROVED },
          orderBy: { createdAt: "desc" },
          select: { id: true, startDate: true, endDate: true },
        }),
        prisma.logbook.findMany({
          where: { studentId },
          select: { id: true, status: true, weekNumber: true },
        }),
        prisma.assessment.findMany({
          where: { studentId },
          select: {
            id: true,
            status: true,
            type: true,
            technical: true,
            communication: true,
            punctuality: true,
            initiative: true,
            teamwork: true,
          },
        }),
        prisma.evaluation.findMany({
          where: { studentId },
          select: { id: true, status: true, type: true, totalScore: true },
        }),
        prisma.visit.findMany({
          where: { studentId },
          select: { id: true, status: true, score: true, visitDate: true },
        }),
      ]);

    const systemScore = calculateSystemContinuousScore({
      placement,
      logbooks,
      assessments,
      evaluations,
      visits,
      scoringConfig: settings || {},
    });

    return {
      student,
      systemScore,
      finalScore: systemScore.systemScore,
      finalGrade: systemScore.provisionalGrade,
    };
  } catch (error) {
    logger.error(`Error getting student final grade: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getStudentFinalGrade };
