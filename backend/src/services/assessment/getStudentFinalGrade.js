const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const {
  HTTP_STATUS,
  ASSESSMENT_STATUS,
  ASSESSMENT_TYPES,
} = require("../../utils/constants");
const logger = require("../../utils/logger");
const { calculateScore, calculateGrade } = require("./helpers");

const prisma = getPrismaClient();

const getStudentFinalGrade = async (studentId) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");

    const departmentalAssessment = await prisma.assessment.findFirst({
      where: {
        studentId,
        type: { in: [ASSESSMENT_TYPES.DEPARTMENTAL, "departmental"] },
        status: ASSESSMENT_STATUS.COMPLETED,
      },
    });

    const industrialAssessment = await prisma.assessment.findFirst({
      where: {
        studentId,
        type: { in: [ASSESSMENT_TYPES.INDUSTRIAL, "industrial"] },
        status: ASSESSMENT_STATUS.COMPLETED,
      },
    });

    if (!departmentalAssessment || !industrialAssessment) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Both departmental and industrial assessments must be completed",
      );
    }

    const deptScore = calculateScore(departmentalAssessment);
    const indScore = calculateScore(industrialAssessment);
    const finalScore = Math.round(deptScore * 0.4 + indScore * 0.6);
    const finalGrade = calculateGrade(finalScore);

    return {
      student,
      departmentalAssessment,
      industrialAssessment,
      departmentalScore: deptScore,
      industrialScore: indScore,
      finalScore,
      finalGrade,
    };
  } catch (error) {
    logger.error(`Error getting student final grade: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getStudentFinalGrade };
