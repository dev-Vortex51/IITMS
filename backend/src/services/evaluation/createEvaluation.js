const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { calculateAverageScore, calculateGrade } = require("./helpers");

const prisma = getPrismaClient();

const createEvaluation = async (evaluationData, supervisorId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        assignedStudents: {
          select: { studentId: true, status: true },
        },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const student = await prisma.student.findUnique({
      where: { id: evaluationData.student },
      select: { id: true, hasPlacement: true },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    const isAssigned = supervisor.assignedStudents.some(
      (item) => item.studentId === student.id && item.status === "active",
    );
    if (!isAssigned) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You are not assigned to this student",
      );
    }

    const existingEvaluation = await prisma.evaluation.findFirst({
      where: {
        studentId: evaluationData.student,
        supervisorId,
        type: evaluationData.type,
      },
      select: { id: true },
    });

    if (existingEvaluation) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `${evaluationData.type} evaluation already exists for this student`,
      );
    }

    const activePlacement = await prisma.placement.findFirst({
      where: {
        studentId: evaluationData.student,
        status: "approved",
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    const scores = evaluationData.scores || {};
    const totalScore = calculateAverageScore(scores);
    const grade = calculateGrade(totalScore);

    const evaluation = await prisma.evaluation.create({
      data: {
        studentId: evaluationData.student,
        supervisorId,
        placementId: activePlacement?.id || null,
        type: evaluationData.type,
        technicalSkill: scores.technicalSkill,
        communication: scores.communication,
        professionalism: scores.professionalism,
        punctuality: scores.punctuality,
        problemSolving: scores.problemSolving,
        workAttitude: scores.workAttitude || null,
        initiative: scores.initiative || null,
        strengths: evaluationData.strengths || null,
        areasForImprovement: evaluationData.areasForImprovement || null,
        comment: evaluationData.comment || null,
        totalScore,
        grade,
      },
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

    logger.info(`Evaluation created: ${evaluation.id}`);
    return evaluation;
  } catch (error) {
    logger.error(`Error creating evaluation: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { createEvaluation };
