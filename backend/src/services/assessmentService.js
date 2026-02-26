const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  ASSESSMENT_STATUS,
  ASSESSMENT_TYPES,
  NOTIFICATION_TYPES,
} = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");

const prisma = getPrismaClient();

/**
 * Create assessment
 */
const createAssessment = async (assessmentData, supervisorId) => {
  try {
    const { student: studentId, type } = assessmentData;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        assignedStudents: {
          select: { studentId: true },
        },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    // Verify supervisor is assigned to student
    const isAssigned = supervisor.assignedStudents.some(
      (s) => s.studentId === studentId,
    );

    if (!isAssigned) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You are not assigned to this student",
      );
    }

    // Check if assessment already exists
    const existingAssessment = await prisma.assessment.findFirst({
      where: { studentId, supervisorId, type },
    });

    if (existingAssessment) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `${type} assessment already exists for this student`,
      );
    }

    const assessment = await prisma.assessment.create({
      data: {
        studentId,
        supervisorId,
        type,
        technical: assessmentData.technical || 0,
        communication: assessmentData.communication || 0,
        punctuality: assessmentData.punctuality || 0,
        initiative: assessmentData.initiative || 0,
        teamwork: assessmentData.teamwork || 0,
        professionalism: assessmentData.professionalism,
        problemSolving: assessmentData.problemSolving,
        adaptability: assessmentData.adaptability,
        strengths: assessmentData.strengths,
        areasForImprovement: assessmentData.areasForImprovement,
        comment: assessmentData.comment,
        recommendation: assessmentData.recommendation,
        status: ASSESSMENT_STATUS.PENDING,
      },
      include: {
        student: { include: { user: true } },
        supervisor: { include: { user: true } },
      },
    });

    logger.info(`Assessment created for student: ${student.id}`);
    return assessment;
  } catch (error) {
    logger.error(`Error creating assessment: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get assessments with filters
 */
const getAssessments = async (filters = {}, pagination = {}) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);
    const where = {};

    if (filters.student) where.studentId = filters.student;
    if (filters.supervisor) where.supervisorId = filters.supervisor;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.department)
      where.student = { departmentId: filters.department };

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        supervisor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.assessment.count({ where });

    return {
      assessments,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    logger.error(`Error getting assessments: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get assessment by ID
 */
const getAssessmentById = async (assessmentId) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        student: { include: { user: true } },
        supervisor: { include: { user: true } },
      },
    });

    if (!assessment)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Assessment not found");
    return assessment;
  } catch (error) {
    logger.error(`Error getting assessment: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Update assessment
 */
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

    // THE FIX: Lock the assessment once it is submitted OR completed
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

/**
 * Submit assessment
 */
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

    // THE FIX: Isolated try-catch and unified recipient key
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

/**
 * Calculate letter grade from numeric score
 */
const calculateGrade = (score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

/**
 * Calculate assessment average score
 */
const calculateScore = (assessment) => {
  const scores = [
    assessment.technical,
    assessment.communication,
    assessment.punctuality,
    assessment.initiative,
    assessment.teamwork,
  ];

  const validScores = scores.filter((s) => s !== null && s !== undefined);
  if (validScores.length === 0) return 0;

  return Math.round(
    validScores.reduce((a, b) => a + b, 0) / validScores.length,
  );
};

/**
 * Verify assessment (by coordinator)
 */
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

    // THE FIX: Isolated try-catch and unified recipient key
    try {
      await notificationService.createNotification({
        recipient: assessment.student.userId,
        type: NOTIFICATION_TYPES.GENERAL || "general",
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

/**
 * Get student final grade
 */
const getStudentFinalGrade = async (studentId) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");

    // THE FIX: Corrected Prisma query for multiple values
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

    // Calculate final grade: 40% academic + 60% industrial
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

/**
 * Get assessments by student
 */
const getStudentAssessments = async (studentId) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { studentId },
      include: {
        supervisor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const summary = {
      total: assessments.length,
      pending: assessments.filter((a) => a.status === ASSESSMENT_STATUS.PENDING)
        .length,
      submitted: assessments.filter(
        (a) => a.status === ASSESSMENT_STATUS.SUBMITTED,
      ).length,
      completed: assessments.filter(
        (a) => a.status === ASSESSMENT_STATUS.COMPLETED,
      ).length,
      assessments,
    };

    return summary;
  } catch (error) {
    logger.error(`Error getting student assessments: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get pending assessments for supervisor
 */
const getSupervisorPendingAssessments = async (supervisorId) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        supervisorId,
        status: ASSESSMENT_STATUS.PENDING,
      },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    return assessments;
  } catch (error) {
    logger.error(
      `Error getting supervisor pending assessments: ${error.message}`,
    );
    throw handlePrismaError(error);
  }
};

module.exports = {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  submitAssessment,
  verifyAssessment,
  getStudentFinalGrade,
  getStudentAssessments,
  getSupervisorPendingAssessments,
};
