const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  PLACEMENT_STATUS,
  NOTIFICATION_TYPES,
} = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");
const userService = require("./userService");

const prisma = getPrismaClient();

/**
 * Create placement application
 */
const createPlacement = async (studentId, placementData, files = {}) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    // Check if student already has pending or approved placement
    const existingPlacement = await prisma.placement.findFirst({
      where: {
        studentId: studentId,
        status: { in: [PLACEMENT_STATUS.PENDING, PLACEMENT_STATUS.APPROVED] },
      },
    });

    if (existingPlacement) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "You already have a pending or approved placement application",
      );
    }

    const placement = await prisma.placement.create({
      data: {
        student: { connect: { id: studentId } },
        companyName: placementData.companyName,
        companyAddress: placementData.companyAddress,
        companyEmail: placementData.companyEmail,
        companyPhone: placementData.companyPhone,
        companyWebsite: placementData.companyWebsite || null,
        companySector: placementData.companySector,
        position: placementData.position,
        department: placementData.department || null,
        supervisorName: placementData.supervisorName,
        supervisorEmail: placementData.supervisorEmail,
        supervisorPhone: placementData.supervisorPhone,
        supervisorPosition: placementData.supervisorPosition,
        startDate: new Date(placementData.startDate),
        endDate: new Date(placementData.endDate),
        acceptanceLetter:
          files?.acceptanceLetter?.filename || placementData.acceptanceLetter,
        acceptanceLetterPath:
          files?.acceptanceLetter?.path || placementData.acceptanceLetterPath,
        status: PLACEMENT_STATUS.PENDING,
      },
    });

    logger.info(`Placement created for student: ${student.matricNumber}`);

    // Notify coordinators
    const dept = await prisma.department.findUnique({
      where: { id: student.departmentId },
      include: {
        coordinators: {
          select: { id: true },
        },
      },
    });

    if (dept && dept.coordinators.length > 0) {
      const studentName = student.user
        ? `${student.user.firstName} ${student.user.lastName}`
        : student.matricNumber;
      await notificationService.createBulkNotifications(
        dept.coordinators.map((c) => c.id),
        {
          type: NOTIFICATION_TYPES.GENERAL,
          title: "New Placement Application",
          message: `Student ${studentName} has submitted a placement application`,
          priority: "medium",
          relatedModel: "Placement",
          relatedId: placement.id,
        },
      );
    }

    return placement;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get all placements with filters
 */
const getPlacements = async (filters = {}, pagination = {}) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);

    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.student) where.studentId = filters.student;

    if (filters.department) {
      // Handle both object and string department formats
      const departmentId =
        typeof filters.department === "object"
          ? filters.department.id
          : filters.department;
      const students = await prisma.student.findMany({
        where: { departmentId },
        select: { id: true },
      });
      where.studentId = { in: students.map((s) => s.id) };
    }

    const placements = await prisma.placement.findMany({
      where,
      include: {
        student: {
          select: {
            matricNumber: true,
            id: true,
            departmentId: true,
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        industrialSupervisor: {
          select: {
            id: true,
            position: true,
            companyName: true,
            companyAddress: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.placement.count({ where });

    // Transform placements to include student name at top level
    const transformedPlacements = placements.map((placement) => {
      return {
        ...placement,
        student: {
          ...placement.student,
          name:
            placement.student?.user?.firstName &&
            placement.student?.user?.lastName
              ? `${placement.student.user.firstName} ${placement.student.user.lastName}`
              : "Unknown Student",
        },
      };
    });

    return {
      placements: transformedPlacements,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get placement by ID
 */
const getPlacementById = async (placementId) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: {
        industrialSupervisor: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    return placement;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Update placement (before approval or rejecting after approval for resubmission)
 */
const updatePlacement = async (placementId, updateData, userId) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: { student: { include: { user: true } } },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    // Only allow updates if pending or if approved but student wants to withdraw for changes
    const allowedStatuses = [
      PLACEMENT_STATUS.PENDING,
      PLACEMENT_STATUS.APPROVED,
    ];
    if (!allowedStatuses.includes(placement.status)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot update placement that has been rejected or withdrawn",
      );
    }

    // Check if user is the student who created the placement
    if (placement.student.userId !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only update your own placement",
      );
    }

    // If placement is approved and student is updating, treat as withdrawal for resubmission
    let updatePayload = { ...updateData };
    if (placement.status === PLACEMENT_STATUS.APPROVED) {
      updatePayload = {
        ...updateData,
        status: PLACEMENT_STATUS.PENDING,
        reviewedById: null,
        reviewedAt: null,
        approvedAt: null,
        industrialSupervisorId: null,
      };

      // Update student to reflect pending status
      await prisma.student.update({
        where: { id: placement.studentId },
        data: {
          placementApproved: false,
          hasPlacement: false,
          currentPlacementId: null,
        },
      });

      // Notify coordinators of resubmission
      const dept = await prisma.department.findUnique({
        where: { id: placement.student.departmentId },
        include: { coordinators: { select: { id: true } } },
      });

      if (dept && dept.coordinators.length > 0) {
        await notificationService.createBulkNotifications(
          dept.coordinators.map((c) => c.id),
          {
            type: NOTIFICATION_TYPES.GENERAL,
            title: "Placement Resubmitted",
            message: `Student ${placement.student.user.firstName} ${placement.student.user.lastName} has updated and resubmitted their placement application`,
            priority: "medium",
            relatedModel: "Placement",
            relatedId: placement.id,
          },
        );
      }

      logger.info(`Placement resubmitted by student: ${placementId}`);
    }

    // Define editable fields
    const editableFields = [
      "companyName",
      "companyAddress",
      "companyEmail",
      "companyPhone",
      "companyWebsite",
      "companySector",
      "position",
      "department",
      "supervisorName",
      "supervisorEmail",
      "supervisorPhone",
      "supervisorPosition",
      "startDate",
      "endDate",
      "expectedLearningOutcomes",
      "specialRequirements",
    ];

    const editableUpdateData = {};
    editableFields.forEach((field) => {
      if (updatePayload[field] !== undefined) {
        editableUpdateData[field] = updatePayload[field];
      }
    });

    const updatedPlacement = await prisma.placement.update({
      where: { id: placementId },
      data: editableUpdateData,
    });

    logger.info(`Placement updated: ${placementId}`);

    return updatedPlacement;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Review placement (approve/reject)
 */
const reviewPlacement = async (placementId, reviewData, reviewerId) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: { student: { include: { user: true } } },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    if (placement.status !== PLACEMENT_STATUS.PENDING) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Placement has already been reviewed",
      );
    }

    const { status, reviewComment } = reviewData;

    if (status === PLACEMENT_STATUS.APPROVED) {
      // Approve placement
      await prisma.placement.update({
        where: { id: placementId },
        data: {
          status: PLACEMENT_STATUS.APPROVED,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          approvedAt: new Date(),
          rejectionReason: null,
        },
      });

      // Update student record
      await prisma.student.update({
        where: { id: placement.studentId },
        data: {
          hasPlacement: true,
          placementApproved: true,
          currentPlacementId: placementId,
          trainingStartDate: placement.startDate,
          trainingEndDate: placement.endDate,
        },
      });

      // Auto-create/invite industrial supervisor if email provided
      if (placement.supervisorEmail) {
        try {
          const supervisorResult = await userService.createIndustrialSupervisor(
            {
              email: placement.supervisorEmail,
              firstName:
                placement.supervisorName?.split(" ")[0] || "Supervisor",
              lastName:
                placement.supervisorName?.split(" ").slice(1).join(" ") || "",
              companyName: placement.companyName,
              companyAddress: placement.companyAddress,
              position: placement.supervisorPosition,
              phone: placement.supervisorPhone,
            },
            reviewerId,
            placementId,
          );

          const { supervisor, requiresSetup, invitation } = supervisorResult;

          if (requiresSetup) {
            logger.info(
              `Invitation sent to industrial supervisor: ${placement.supervisorEmail}`,
            );
            // The invitation email is already sent by invitationService.createInvitation
          } else if (supervisor) {
            // Existing supervisor - assign them immediately
            await prisma.placement.update({
              where: { id: placementId },
              data: { industrialSupervisorId: supervisor.id },
            });

            await prisma.student.update({
              where: { id: placement.studentId },
              data: { industrialSupervisorId: supervisor.id },
            });

            // Create supervisor assignment record
            await prisma.supervisorAssignment.upsert({
              where: {
                studentId_supervisorId_placementId: {
                  studentId: placement.studentId,
                  supervisorId: supervisor.id,
                  placementId: placementId,
                },
              },
              create: {
                studentId: placement.studentId,
                supervisorId: supervisor.id,
                placementId: placementId,
                status: "active",
              },
              update: {
                status: "active",
                assignedAt: new Date(),
                revokedAt: null,
              },
            });

            logger.info(
              `Industrial supervisor ${placement.supervisorEmail} assigned to placement ${placementId}`,
            );
          }
        } catch (supervisorError) {
          logger.error(
            `Failed to create/assign industrial supervisor: ${supervisorError.message}`,
          );
          // Don't fail the approval if supervisor creation fails
        }
      }

      // Send approval notification
      await notificationService.createNotification({
        recipientId: placement.student.userId,
        type: NOTIFICATION_TYPES.PLACEMENT_APPROVED,
        title: "Placement Approved",
        message: `Your placement at ${placement.companyName} has been approved!`,
        priority: "high",
        relatedModel: "Placement",
        relatedId: placement.id,
        createdById: reviewerId,
        sendEmail: true,
      });

      logger.info(`Placement approved: ${placementId}`);
    } else {
      // Reject placement
      await prisma.placement.update({
        where: { id: placementId },
        data: {
          status: PLACEMENT_STATUS.REJECTED,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: reviewComment,
        },
      });

      // Send rejection notification
      await notificationService.createNotification({
        recipientId: placement.student.userId,
        type: NOTIFICATION_TYPES.PLACEMENT_REJECTED,
        title: "Placement Not Approved",
        message: `Your placement application was not approved. Reason: ${reviewComment}`,
        priority: "high",
        relatedModel: "Placement",
        relatedId: placement.id,
        createdById: reviewerId,
        sendEmail: true,
      });

      logger.info(`Placement rejected: ${placementId}`);
    }

    return await prisma.placement.findUnique({ where: { id: placementId } });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Assign industrial supervisor to placement
 */
const assignIndustrialSupervisor = async (
  placementId,
  supervisorData,
  assignerId,
) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: { student: true },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    if (placement.status !== PLACEMENT_STATUS.APPROVED) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Can only assign supervisor to approved placements",
      );
    }

    // Create or get industrial supervisor (pass placementId for invitation metadata)
    const result = await userService.createIndustrialSupervisor(
      {
        ...supervisorData,
        companyName: placement.companyName,
        companyAddress: placement.companyAddress,
      },
      assignerId,
      placementId, // Pass placement ID to link invitation
    );

    const { user, supervisor, requiresSetup, invitation } = result;

    // If invitation was created (new supervisor), we can't complete the assignment yet
    if (requiresSetup) {
      logger.info(
        `Invitation sent to industrial supervisor: ${supervisorData.email}. Assignment will be completed after they accept.`,
      );

      // Notify student that invitation was sent
      try {
        await notificationService.createNotification({
          recipientId: placement.student.userId,
          type: NOTIFICATION_TYPES.GENERAL,
          title: "Supervisor Invitation Sent",
          message: `An invitation has been sent to your industrial supervisor at ${supervisorData.email}. They will be assigned to you once they complete their account setup.`,
          priority: "medium",
          relatedModel: "Placement",
          relatedId: placementId,
          createdById: assignerId,
          sendEmail: false,
        });
      } catch (e) {
        logger.warn(`Failed to notify student: ${e.message}`);
      }

      return {
        success: true,
        message: "Invitation sent to industrial supervisor",
        invitation,
        pendingSetup: true,
      };
    }

    // Existing supervisor found - complete the assignment
    // Assign to placement
    await prisma.placement.update({
      where: { id: placementId },
      data: { industrialSupervisorId: supervisor.id },
    });

    // Update student record
    await prisma.student.update({
      where: { id: placement.studentId },
      data: { industrialSupervisorId: supervisor.id },
    });

    // Create supervisor assignment record
    await prisma.supervisorAssignment.upsert({
      where: {
        studentId_supervisorId_placementId: {
          studentId: placement.studentId,
          supervisorId: supervisor.id,
          placementId: placementId,
        },
      },
      create: {
        studentId: placement.studentId,
        supervisorId: supervisor.id,
        placementId: placementId,
        status: "active",
      },
      update: {
        status: "active",
        assignedAt: new Date(),
        revokedAt: null,
      },
    });

    // Notify supervisor
    try {
      await notificationService.createNotification({
        recipientId: user.id,
        type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
        title: "Student Assigned",
        message: `You have been assigned as industrial supervisor for ${placement.student.id}`,
        priority: "high",
        createdById: assignerId,
        sendEmail: true,
      });
    } catch (e) {
      logger.warn(`Failed to notify supervisor: ${e.message}`);
    }

    // Notify student
    try {
      await notificationService.createNotification({
        recipientId: placement.student.userId,
        type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
        title: "Supervisor Assigned",
        message: `${user.firstName} ${user.lastName} has been assigned as your industrial supervisor`,
        priority: "medium",
        createdById: assignerId,
      });
    } catch (e) {
      logger.warn(`Failed to notify student: ${e.message}`);
    }

    logger.info(`Industrial supervisor assigned to placement: ${placementId}`);

    return await prisma.placement.findUnique({ where: { id: placementId } });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Approve placement (Wrapper for reviewPlacement)
 */
const approvePlacement = async (placementId, remarks, reviewerId) => {
  // Simply route the request to our main review function
  return await reviewPlacement(
    placementId,
    {
      status: PLACEMENT_STATUS.APPROVED,
      reviewComment: remarks,
    },
    reviewerId,
  );
};

/**
 * Reject placement (Wrapper for reviewPlacement)
 */
const rejectPlacement = async (placementId, remarks, reviewerId) => {
  // Enforce the remarks requirement before routing
  if (!remarks) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Remarks are required when rejecting a placement",
    );
  }

  // Route to the main review function
  return await reviewPlacement(
    placementId,
    {
      status: PLACEMENT_STATUS.REJECTED,
      reviewComment: remarks,
    },
    reviewerId,
  );
};

/**
 * Withdraw placement (student initiates)
 */
const withdrawPlacement = async (placementId, userId) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    // Check if user is the student who created the placement
    if (placement.student.userId !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only withdraw your own placement",
      );
    }

    // Allow withdrawal of pending or approved placements
    if (
      placement.status !== PLACEMENT_STATUS.PENDING &&
      placement.status !== PLACEMENT_STATUS.APPROVED
    ) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot withdraw rejected or already withdrawn placements",
      );
    }

    const wasApproved = placement.status === PLACEMENT_STATUS.APPROVED;

    // Update placement status
    await prisma.placement.update({
      where: { id: placementId },
      data: { status: PLACEMENT_STATUS.WITHDRAWN },
    });

    // If placement was approved and had an industrial supervisor, unassign them
    if (wasApproved && placement.industrialSupervisorId) {
      // Remove student from supervisor's assignments
      await prisma.supervisorAssignment.updateMany({
        where: {
          studentId: placement.studentId,
          supervisorId: placement.industrialSupervisorId,
        },
        data: { status: "revoked", revokedAt: new Date() },
      });

      logger.info(
        `Unassigned industrial supervisor from student: ${placement.studentId}`,
      );
    }

    // Update student record
    await prisma.student.update({
      where: { id: placement.studentId },
      data: {
        hasPlacement: false,
        placementApproved: false,
        currentPlacementId: null,
        industrialSupervisorId: null,
        trainingStartDate: null,
        trainingEndDate: null,
      },
    });

    // Notify coordinators
    const dept = await prisma.department.findUnique({
      where: { id: placement.student.departmentId },
      include: { coordinators: { select: { id: true } } },
    });

    if (dept && dept.coordinators.length > 0) {
      const studentName = `${placement.student.user.firstName} ${placement.student.user.lastName}`;
      await notificationService.createBulkNotifications(
        dept.coordinators.map((c) => c.id),
        {
          type: NOTIFICATION_TYPES.GENERAL,
          title: "Placement Withdrawn",
          message: `Student ${studentName} has withdrawn their placement application`,
          priority: "low",
          relatedModel: "Placement",
          relatedId: placement.id,
        },
      );
    }

    logger.info(`Placement withdrawn by student: ${placementId}`);

    return await prisma.placement.findUnique({ where: { id: placementId } });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Delete placement (withdraw)
 */
const deletePlacement = async (placementId) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    if (placement.status === PLACEMENT_STATUS.APPROVED) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot delete approved placement. Use withdraw endpoint instead.",
      );
    }

    await prisma.placement.update({
      where: { id: placementId },
      data: { status: PLACEMENT_STATUS.WITHDRAWN },
    });

    logger.info(`Placement withdrawn: ${placementId}`);

    return await prisma.placement.findUnique({ where: { id: placementId } });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Update placement by coordinator (assign supervisors)
 */
const updatePlacementByCoordinator = async (placementId, updateData, user) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: {
        student: {
          include: { department: { include: { faculty: true } } },
        },
      },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    const { USER_ROLES } = require("../utils/constants");

    // Handle departmental supervisor assignment
    if (updateData.departmentalSupervisor) {
      const supervisor = await prisma.supervisor.findUnique({
        where: { id: updateData.departmentalSupervisor },
      });

      if (!supervisor) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
      }

      if (
        supervisor.type !== "departmental" &&
        supervisor.type !== "academic"
      ) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Can only assign departmental supervisors through this endpoint",
        );
      }

      // Check if supervisor has reached max students capacity
      const maxStudents = supervisor.maxStudents || 5;
      const currentStudentCount = await prisma.supervisorAssignment.count({
        where: { supervisorId: supervisor.id, status: "active" },
      });

      const isAlreadyAssigned = await prisma.supervisorAssignment.findFirst({
        where: {
          studentId: placement.studentId,
          supervisorId: supervisor.id,
          status: "active",
        },
      });

      if (!isAlreadyAssigned && currentStudentCount >= maxStudents) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Supervisor has reached maximum capacity of ${maxStudents} students`,
        );
      }

      // Verify coordinator has access to this student
      if (
        user.role === USER_ROLES.COORDINATOR &&
        placement.student.departmentId !== user.departmentId
      ) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "You can only assign supervisors to students in your department",
        );
      }

      // Update student record
      await prisma.student.update({
        where: { id: placement.studentId },
        data: { departmentalSupervisorId: updateData.departmentalSupervisor },
      });

      // Create or update supervisor assignment
      if (!isAlreadyAssigned) {
        await prisma.supervisorAssignment.create({
          data: {
            studentId: placement.studentId,
            supervisorId: supervisor.id,
            status: "active",
          },
        });
      }

      logger.info(
        `Departmental supervisor assigned to student: ${placement.studentId}`,
      );
    }

    // Handle industrial supervisor assignment
    if (updateData.industrialSupervisor) {
      const supervisor = await prisma.supervisor.findUnique({
        where: { id: updateData.industrialSupervisor },
      });

      if (!supervisor) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
      }

      if (supervisor.type !== "industrial") {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Can only assign industrial supervisors through this endpoint",
        );
      }

      // Update placement and student
      await prisma.placement.update({
        where: { id: placementId },
        data: { industrialSupervisorId: updateData.industrialSupervisor },
      });

      await prisma.student.update({
        where: { id: placement.studentId },
        data: { industrialSupervisorId: updateData.industrialSupervisor },
      });

      // Create or update supervisor assignment
      await prisma.supervisorAssignment.upsert({
        where: {
          studentId_supervisorId_placementId: {
            studentId: placement.studentId,
            supervisorId: supervisor.id,
            placementId: placementId,
          },
        },
        create: {
          studentId: placement.studentId,
          supervisorId: supervisor.id,
          placementId: placementId,
          status: "active",
        },
        update: { status: "active" },
      });

      logger.info(
        `Industrial supervisor assigned to student: ${placement.studentId}`,
      );
    }

    return await prisma.placement.findUnique({
      where: { id: placementId },
      include: { industrialSupervisor: true },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get student's most recent placement
 */
const getStudentPlacement = async (studentId) => {
  try {
    // Find the student's most recent placement (sorted by creation date)
    const placement = await prisma.placement.findFirst({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      include: {
        industrialSupervisor: {
          select: {
            id: true,
            position: true,
            companyName: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        student: {
          select: { matricNumber: true },
        },
      },
    });

    if (!placement) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "No placement found for this student",
      );
    }

    return placement;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = {
  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  withdrawPlacement,
  reviewPlacement,
  approvePlacement,
  rejectPlacement,
  assignIndustrialSupervisor,
  updatePlacementByCoordinator,
  deletePlacement,
  getStudentPlacement,
};
