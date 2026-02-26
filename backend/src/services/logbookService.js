const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  LOGBOOK_STATUS,
  NOTIFICATION_TYPES,
} = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");

const prisma = getPrismaClient();

/**
 * Create logbook entry
 */
const createLogbookEntry = async (studentId, logbookData, files = []) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        placement: {
          where: { status: "approved" },
          take: 1,
        },
      },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    // Verify student has approved placement and training has started
    if (!student.placementApproved || !student.trainingStartDate) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You cannot submit logbook. Ensure your placement is approved and training has started.",
      );
    }

    // Check if logbook for this week already exists
    const existingLogbook = await prisma.logbook.findFirst({
      where: {
        studentId,
        weekNumber: logbookData.weekNumber,
      },
    });

    if (existingLogbook) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Logbook for week ${logbookData.weekNumber} already exists`,
      );
    }

    // Create logbook
    const logbook = await prisma.logbook.create({
      data: {
        studentId,
        weekNumber: logbookData.weekNumber,
        startDate: new Date(logbookData.startDate),
        endDate: new Date(logbookData.endDate),
        tasksPerformed: logbookData.tasksPerformed,
        skillsAcquired: logbookData.skillsAcquired || "",
        challenges: logbookData.challenges || "",
        lessonsLearned: logbookData.lessonsLearned || "",
        status: LOGBOOK_STATUS.DRAFT,
        // Create evidence files
        evidence: {
          createMany: {
            data: files.map((file) => ({
              name: file.originalname,
              path: file.path,
              type: file.mimetype,
            })),
          },
        },
      },
      include: {
        evidence: true,
        reviews: true,
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    logger.info(
      `Logbook entry created for student: ${student.id}, week: ${logbookData.weekNumber}`,
    );

    return logbook;
  } catch (error) {
    logger.error(`Error creating logbook entry: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get logbooks with filters
 */
const getLogbooks = async (filters = {}, pagination = {}) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);

    const where = {};

    if (filters.student) where.studentId = filters.student;
    if (filters.status) where.status = filters.status;
    if (filters.weekNumber) where.weekNumber = filters.weekNumber;

    // Filter by department if specified
    if (filters.department) {
      where.student = {
        departmentId: filters.department,
      };
    }

    const logbooks = await prisma.logbook.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        evidence: true,
        reviews: {
          include: {
            supervisor: {
              select: {
                id: true,
                type: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: [{ weekNumber: "desc" }, { createdAt: "desc" }],
    });

    const total = await prisma.logbook.count({ where });

    return {
      logbooks,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    logger.error(`Error getting logbooks: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get logbook by ID
 */
const getLogbookById = async (logbookId) => {
  try {
    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        evidence: true,
        reviews: {
          include: {
            supervisor: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!logbook) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
    }

    return logbook;
  } catch (error) {
    logger.error(`Error getting logbook: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Update logbook entry (before submission)
 */
const updateLogbookEntry = async (logbookId, updateData, userId) => {
  try {
    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
      include: { student: true },
    });

    if (!logbook) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
    }

    if (logbook.status !== LOGBOOK_STATUS.DRAFT) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot update submitted logbook",
      );
    }

    // Verify ownership
    if (logbook.student.userId !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only update your own logbook",
      );
    }

    const updated = await prisma.logbook.update({
      where: { id: logbookId },
      data: {
        tasksPerformed: updateData.tasksPerformed || logbook.tasksPerformed,
        skillsAcquired: updateData.skillsAcquired || logbook.skillsAcquired,
        challenges: updateData.challenges || logbook.challenges,
        lessonsLearned: updateData.lessonsLearned || logbook.lessonsLearned,
      },
      include: {
        evidence: true,
        reviews: true,
      },
    });

    logger.info(`Logbook updated: ${logbookId}`);

    return updated;
  } catch (error) {
    logger.error(`Error updating logbook: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Submit logbook entry
 */
const submitLogbookEntry = async (logbookId, userId) => {
  try {
    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            departmentalSupervisor: {
              select: { id: true, userId: true },
            },
            industrialSupervisor: {
              select: { id: true, userId: true },
            },
          },
        },
      },
    });

    if (!logbook) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
    }

    if (logbook.status !== LOGBOOK_STATUS.DRAFT) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Logbook already submitted");
    }

    // Verify ownership
    if (logbook.student.userId !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only submit your own logbook",
      );
    }

    const updated = await prisma.logbook.update({
      where: { id: logbookId },
      data: {
        status: LOGBOOK_STATUS.SUBMITTED,
        submittedAt: new Date(),
      },
      include: {
        evidence: true,
        reviews: true,
        student: {
          include: { user: true },
        },
      },
    });

    // Notify supervisors
    if (logbook.student.departmentalSupervisor) {
      await notificationService.createNotification({
        recipientId: logbook.student.departmentalSupervisor.userId,
        type: NOTIFICATION_TYPES.GENERAL,
        title: "New Logbook Submission",
        message: `${logbook.student.user.firstName} ${logbook.student.user.lastName} has submitted Week ${logbook.weekNumber} logbook`,
        priority: "medium",
        relatedModel: "Logbook",
        relatedId: logbookId,
      });
    }

    if (logbook.student.industrialSupervisor) {
      await notificationService.createNotification({
        recipientId: logbook.student.industrialSupervisor.userId,
        type: NOTIFICATION_TYPES.GENERAL,
        title: "New Logbook Submission",
        message: `${logbook.student.user.firstName} ${logbook.student.user.lastName} has submitted Week ${logbook.weekNumber} logbook`,
        priority: "medium",
        relatedModel: "Logbook",
        relatedId: logbookId,
      });
    }

    logger.info(`Logbook submitted: ${logbookId}`);

    return updated;
  } catch (error) {
    logger.error(`Error submitting logbook: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Review logbook (by supervisor)
 */
const reviewLogbook = async (
  logbookId,
  reviewData,
  supervisorId,
  supervisorType,
) => {
  try {
    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
      include: { student: true },
    });

    if (!logbook) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
    }

    if (
      logbook.status !== LOGBOOK_STATUS.SUBMITTED &&
      logbook.status !== LOGBOOK_STATUS.REVIEWED
    ) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Logbook not ready for review",
      );
    }

    // Verify supervisor exists and is assigned to student
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

    const isAssigned = supervisor.assignedStudents.some(
      (s) => s.studentId === logbook.studentId,
    );

    if (!isAssigned) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You are not assigned to this student",
      );
    }

    // Check if review already exists for this supervisor
    const existingReview = await prisma.logbookReview.findFirst({
      where: {
        logbookId,
        supervisorId,
      },
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.logbookReview.update({
        where: { id: existingReview.id },
        data: {
          comment: reviewData.comment,
          rating: reviewData.rating,
          status: reviewData.status || LOGBOOK_STATUS.REVIEWED,
          reviewedAt: new Date(),
        },
      });
    } else {
      // Create new review
      review = await prisma.logbookReview.create({
        data: {
          logbookId,
          supervisorId,
          supervisorType:
            supervisorType === "academic" ? "academic" : "industrial",
          comment: reviewData.comment,
          rating: reviewData.rating,
          status: reviewData.status || LOGBOOK_STATUS.REVIEWED,
        },
      });
    }

    // Update logbook status to REVIEWED if not already
    if (logbook.status === LOGBOOK_STATUS.SUBMITTED) {
      await prisma.logbook.update({
        where: { id: logbookId },
        data: { status: LOGBOOK_STATUS.REVIEWED },
      });
    }

    // Check if both supervisors have reviewed to determine final status
    const allReviews = await prisma.logbookReview.findMany({
      where: { logbookId },
      select: { status: true },
    });

    if (allReviews.length >= 2) {
      // Check if ANY of the reviews marked it as REJECTED
      const hasRejection = allReviews.some(
        (review) => review.status === LOGBOOK_STATUS.REJECTED,
      );

      // Determine the final state of the logbook
      const finalLogbookStatus = hasRejection
        ? LOGBOOK_STATUS.REJECTED
        : LOGBOOK_STATUS.APPROVED;

      await prisma.logbook.update({
        where: { id: logbookId },
        data: { status: finalLogbookStatus },
      });
    }

    // Notify student
    const student = await prisma.student.findUnique({
      where: { id: logbook.studentId },
      include: { user: true },
    });

    await notificationService.createNotification({
      recipientId: student.userId,
      type: NOTIFICATION_TYPES.LOGBOOK_COMMENT,
      title: "Logbook Reviewed",
      message: `Your Week ${logbook.weekNumber} logbook has been reviewed by your ${supervisorType} supervisor`,
      priority: "medium",
      relatedModel: "Logbook",
      relatedId: logbookId,
    });

    logger.info(
      `Logbook reviewed by ${supervisorType} supervisor: ${logbookId}`,
    );

    return review;
  } catch (error) {
    logger.error(`Error reviewing logbook: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get logbooks pending review for supervisor
 */
const getLogbooksPendingReview = async (supervisorId) => {
  try {
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

    const studentIds = supervisor.assignedStudents.map((s) => s.studentId);

    // Get logbooks that are submitted/reviewed but not fully reviewed by this supervisor
    const logbooks = await prisma.logbook.findMany({
      where: {
        studentId: { in: studentIds },
        status: { in: [LOGBOOK_STATUS.SUBMITTED, LOGBOOK_STATUS.REVIEWED] },
        reviews: {
          none: {
            supervisorId,
          },
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        evidence: true,
      },
    });

    return logbooks;
  } catch (error) {
    logger.error(`Error getting pending logbooks: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get student logbook summary
 */
const getStudentLogbookSummary = async (studentId) => {
  try {
    const [
      totalLogbooks,
      submittedLogbooks,
      approvedLogbooks,
      rejectedLogbooks,
      logbookList,
    ] = await Promise.all([
      prisma.logbook.count({ where: { studentId } }),
      prisma.logbook.count({
        where: {
          studentId,
          status: {
            in: [
              LOGBOOK_STATUS.SUBMITTED,
              LOGBOOK_STATUS.REVIEWED,
              LOGBOOK_STATUS.APPROVED,
            ],
          },
        },
      }),
      prisma.logbook.count({
        where: { studentId, status: LOGBOOK_STATUS.APPROVED },
      }),
      prisma.logbook.count({
        where: { studentId, status: LOGBOOK_STATUS.REJECTED },
      }),
      prisma.logbook.findMany({
        where: { studentId },
        orderBy: { weekNumber: "asc" },
        include: {
          evidence: true,
          reviews: true,
        },
      }),
    ]);

    return {
      total: totalLogbooks,
      submitted: submittedLogbooks,
      approved: approvedLogbooks,
      rejected: rejectedLogbooks,
      logbooks: logbookList,
    };
  } catch (error) {
    logger.error(`Error getting logbook summary: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = {
  createLogbookEntry,
  getLogbooks,
  getLogbookById,
  updateLogbookEntry,
  submitLogbookEntry,
  reviewLogbook,
  getLogbooksPendingReview,
  getStudentLogbookSummary,
};
