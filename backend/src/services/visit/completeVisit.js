const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, NOTIFICATION_TYPES, ASSESSMENT_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { canManageVisit, visitInclude } = require("./helpers");
const notificationService = require("../notificationService");
const { calculateScore, calculateGrade } = require("../assessment/helpers");
const { notifyUser } = require("../../realtime/events");

const prisma = getPrismaClient();

const completeVisit = async (id, payload, user) => {
  try {
    const existingVisit = await prisma.visit.findUnique({
      where: { id },
      include: {
        student: {
          select: { departmentId: true, userId: true, id: true, industrialSupervisorId: true },
        },
        supervisor: {
          select: { id: true },
        },
      },
    });

    if (!existingVisit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Visit record not found");
    }

    if (!canManageVisit(existingVisit, user)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to complete this visit",
      );
    }

    const coordinatorDepartmentId = user.departmentId || user.department;
    if (
      user.role === "coordinator" &&
      coordinatorDepartmentId &&
      existingVisit.student?.departmentId !== coordinatorDepartmentId
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have access to this department visit",
      );
    }

    const completedVisit = await prisma.visit.update({
      where: { id },
      data: {
        status: "completed",
        completedAt: new Date(),
        feedback:
          payload.feedback !== undefined
            ? payload.feedback || null
            : existingVisit.feedback,
        score: payload.score !== undefined ? payload.score : existingVisit.score,
      },
      include: visitInclude,
    });

    // Create linked assessment if assessment data is provided
    if (payload.assessment) {
      const assessmentData = payload.assessment;

      try {
        const assessment = await prisma.assessment.create({
          data: {
            studentId: existingVisit.student.id,
            supervisorId: existingVisit.supervisor.id,
            placementId: existingVisit.placementId,
            visitId: id,
            type: assessmentData.type || "departmental",
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
            recommendation: assessmentData.recommendation || "good",
            status: ASSESSMENT_STATUS.PENDING,
          },
        });

        if (existingVisit.student?.userId) {
          await notificationService.createNotification({
            recipientId: existingVisit.student.userId,
            type: NOTIFICATION_TYPES.ASSESSMENT_ASSIGNED,
            title: "New Assessment from Visit",
            message: `An assessment has been created from your visit.`,
            priority: "medium",
            relatedModel: "Assessment",
            relatedId: assessment.id,
          });
        }

        // Notify the industrial supervisor that their feedback is needed
        const industrialSupervisorId = existingVisit.student.industrialSupervisorId;
        if (industrialSupervisorId) {
          const industrialSupervisor = await prisma.supervisor.findUnique({
            where: { id: industrialSupervisorId },
            select: { userId: true },
          });
          if (industrialSupervisor?.userId) {
            await notificationService.createNotification({
              recipientId: industrialSupervisor.userId,
              type: NOTIFICATION_TYPES.ASSESSMENT_ASSIGNED,
              title: "Student Assessment Feedback Required",
              message: `The academic supervisor has completed a visit assessment and your feedback is needed.`,
              priority: "high",
              relatedModel: "Assessment",
              relatedId: assessment.id,
              actionLink: "/i-supervisor/assessments",
              actionText: "Provide Feedback",
            });
          }
        }
      } catch (assessmentError) {
        logger.warn(`Failed to create linked assessment for visit ${id}: ${assessmentError.message}`);
      }
    }

    if (existingVisit.student?.userId) {
      await notificationService.createNotification({
        recipientId: existingVisit.student.userId,
        type: NOTIFICATION_TYPES.GENERAL,
        title: "Visit Completed",
        message: `Your visit has been marked as completed.`,
        priority: "low",
        relatedModel: "Visit",
        relatedId: id,
      });

      notifyUser(existingVisit.student.userId, "visit:completed", {
        visitId: id,
        score: payload.score,
      });
    }

    return completedVisit;
  } catch (error) {
    logger.error(`Error completing visit: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { completeVisit };
