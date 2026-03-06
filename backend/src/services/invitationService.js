const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { USER_ROLES, NOTIFICATION_TYPES } = require("../utils/constants");
const { ApiError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const emailService = require("../utils/emailService");
const crypto = require("crypto");
const notificationService = require("./notificationService");

const prisma = getPrismaClient();

/**
 * Generate random token for invitation
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Create an invitation
 */
const createInvitation = async (inviterUser, invitationData) => {
  try {
    const { email, role, metadata = {} } = invitationData;

    validateInvitationPermissions(inviterUser.role, role);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ApiError(400, "A user with this email already exists");
    }

    // Check for pending invitations
    const pendingInvitation = await prisma.invitation.findFirst({
      where: {
        email: email.toLowerCase(),
        status: "pending",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (pendingInvitation) {
      throw new ApiError(
        400,
        "An active invitation already exists for this email",
      );
    }

    // Prepare metadata
    let departmentId = metadata.department || inviterUser.departmentId;

    // Validate department requirement for specific roles
    if ([USER_ROLES.STUDENT, USER_ROLES.COORDINATOR].includes(role)) {
      if (!departmentId) {
        throw new ApiError(
          400,
          `Department is required when inviting a ${role}. Please specify department in metadata.`,
        );
      }
    }

    // Generate secure token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email: email.toLowerCase(),
        role,
        token,
        expiresAt,
        invitedById: inviterUser.id,
        invitedByRole:
          inviterUser.role === USER_ROLES.ADMIN ? "admin" : "coordinator",
        status: "pending",
        departmentId,
        matricNumber: metadata.matricNumber,
        level: metadata.level,
        session: metadata.session,
        // Industrial supervisor metadata
        companyName: metadata.companyName,
        companyAddress: metadata.companyAddress,
        position: metadata.position,
        yearsOfExperience: metadata.yearsOfExperience,
        placementId: metadata.placementId,
      },
      include: {
        invitedBy: {
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
    });

    // Send magic link email
    try {
      await emailService.sendInvitation({
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        invitedBy: {
          firstName: invitation.invitedBy.firstName,
          lastName: invitation.invitedBy.lastName,
        },
      });
    } catch (emailError) {
      logger.error("Failed to send invitation email", emailError);
      // Don't fail the invitation creation if email fails
    }

    logger.info(
      `Invitation created for ${email} as ${role} by ${inviterUser.email}`,
    );

    try {
      await notificationService.createNotification({
        recipientId: inviterUser.id,
        type: NOTIFICATION_TYPES.INVITE_SENT,
        title: "Invitation Sent",
        message: `Invitation sent to ${invitation.email} for role ${invitation.role}.`,
        priority: "low",
        relatedModel: "Invitation",
        relatedId: invitation.id,
        createdById: inviterUser.id,
      });
    } catch (notifError) {
      logger.warn(`Failed to create invite-sent notification: ${notifError.message}`);
    }

    return invitation;
  } catch (error) {
    logger.error(`Error creating invitation: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Validate invitation permissions based on roles
 */
const validateInvitationPermissions = (inviterRole, inviteeRole) => {
  const permissions = {
    [USER_ROLES.ADMIN]: [
      USER_ROLES.COORDINATOR,
      USER_ROLES.ACADEMIC_SUPERVISOR,
      USER_ROLES.FACULTY,
    ],
    [USER_ROLES.COORDINATOR]: [
      USER_ROLES.STUDENT,
      USER_ROLES.INDUSTRIAL_SUPERVISOR,
    ],
  };

  const allowedRoles = permissions[inviterRole];

  if (!allowedRoles || !allowedRoles.includes(inviteeRole)) {
    throw new ApiError(
      403,
      `You do not have permission to invite users with role: ${inviteeRole}`,
    );
  }
};

/**
 * Get invitations with filters
 */
const getInvitations = async (user, filters = {}) => {
  try {
    const where = {};

    // Department-scoped access for coordinators
    if (user.role === USER_ROLES.COORDINATOR) {
      where.invitedById = user.id;
    }

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.email) {
      where.email = {
        contains: filters.email,
        mode: "insensitive",
      };
    }

    const invitations = await prisma.invitation.findMany({
      where,
      include: {
        invitedBy: {
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
      orderBy: { createdAt: "desc" },
    });

    return invitations;
  } catch (error) {
    logger.error(`Error getting invitations: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get invitation by ID
 */
const getInvitationById = async (invitationId, user) => {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        invitedBy: {
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
    });

    if (!invitation) {
      throw new ApiError(404, "Invitation not found");
    }

    // Access control
    if (
      user.role === USER_ROLES.COORDINATOR &&
      invitation.invitedById !== user.id
    ) {
      throw new ApiError(403, "Access denied to this invitation");
    }

    return invitation;
  } catch (error) {
    logger.error(`Error getting invitation: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Verify invitation token
 */
const verifyToken = async (token) => {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        role: true,
        token: true,
        expiresAt: true,
        status: true,
        departmentId: true,
        facultyId: true,
        matricNumber: true,
        level: true,
        session: true,
        // Industrial supervisor metadata
        companyName: true,
        companyAddress: true,
        position: true,
        yearsOfExperience: true,
        placementId: true,
        invitedById: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            role: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new ApiError(404, "Invalid invitation token");
    }

    if (invitation.status !== "pending") {
      throw new ApiError(400, `This invitation has been ${invitation.status}`);
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      throw new ApiError(400, "This invitation has expired");
    }

    // Check if user already exists (in case created after invitation)
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "cancelled" },
      });
      throw new ApiError(400, "An account already exists for this email");
    }

    return invitation;
  } catch (error) {
    logger.error(`Error verifying token: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Resend invitation
 */
const resendInvitation = async (invitationId, user) => {
  try {
    const invitation = await getInvitationById(invitationId, user);

    if (invitation.status !== "pending") {
      throw new ApiError(400, "Can only resend pending invitations");
    }

    // Check if enough time has passed (5 minute cooldown)
    if (invitation.lastResentAt) {
      const timeSinceLastResend =
        new Date() - new Date(invitation.lastResentAt);
      const fiveMinutes = 5 * 60 * 1000;

      if (timeSinceLastResend < fiveMinutes) {
        throw new ApiError(
          400,
          "Please wait at least 5 minutes before resending",
        );
      }
    }

    // Update resend tracking
    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        resendCount: { increment: 1 },
        lastResentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Extend expiration
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send magic link email again
    try {
      await emailService.resendInvitation({
        email: updatedInvitation.email,
        role: updatedInvitation.role,
        token: updatedInvitation.token,
        invitedBy: {
          firstName: updatedInvitation.invitedBy.firstName,
          lastName: updatedInvitation.invitedBy.lastName,
        },
      });
    } catch (emailError) {
      logger.error("Failed to resend invitation email", emailError);
      // Don't fail if email fails
    }

    logger.info(
      `Invitation resent for ${updatedInvitation.email} by ${user.email}`,
    );

    return updatedInvitation;
  } catch (error) {
    logger.error(`Error resending invitation: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Cancel invitation
 */
const cancelInvitation = async (invitationId, user) => {
  try {
    const invitation = await getInvitationById(invitationId, user);

    if (invitation.status !== "pending") {
      throw new ApiError(400, "Can only cancel pending invitations");
    }

    const updated = await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    logger.info(
      `Invitation cancelled for ${invitation.email} by ${user.email}`,
    );

    return updated;
  } catch (error) {
    logger.error(`Error cancelling invitation: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Complete setup after invitation verification
 */
const completeSetup = async (token, userData) => {
  try {
    // 1. Verify token & validate basic data
    const invitation = await verifyToken(token);
    const { firstName, lastName, password, phone, ...additionalData } =
      userData;

    if (!firstName || !lastName || !password) {
      throw new ApiError(
        400,
        "First name, last name, and password are required",
      );
    }

    const userService = require("./userService");
    const userPayload = {
      email: invitation.email,
      firstName,
      lastName,
      password,
      phone,
      role: invitation.role,
      department: invitation.departmentId, // userService expects 'department' not 'departmentId'
      // Pass company data for industrial supervisors so createUser validation passes
      companyName:
        additionalData.companyName || invitation.companyName || "Not Specified",
      companyAddress:
        additionalData.companyAddress || invitation.companyAddress || "",
      position: additionalData.position || invitation.position || "",
      yearsOfExperience:
        additionalData.yearsOfExperience || invitation.yearsOfExperience || 0,
      specialization: additionalData.specialization || "",
    };

    // 2. Create the base user
    let user;
    try {
      const result = await userService.createUser(userPayload, {
        role: invitation.invitedBy?.role || USER_ROLES.ADMIN,
        id: invitation.invitedById,
      });
      user = result.user; // Extract the user object from result
    } catch (error) {
      throw new ApiError(400, `Failed to create base user: ${error.message}`);
    }

    // 3. Create profiles & update invitation (only for roles not handled by createUser)
    try {
      // We use a Prisma Transaction so these happen simultaneously
      await prisma.$transaction(async (tx) => {
        // Create Student Profile (createUser skips this for invitation flow)
        if (invitation.role === USER_ROLES.STUDENT) {
          // Generate matricNumber if not provided (temporary, can be updated later)
          const matricNumber =
            invitation.matricNumber ||
            additionalData.matricNumber ||
            `TEMP-${user.id.substring(0, 8).toUpperCase()}`;

          logger.info(
            `Creating student profile for user ${user.id} with dept ${invitation.departmentId}`,
          );

          try {
            await tx.student.create({
              data: {
                user: { connect: { id: user.id } },
                matricNumber,
                level: invitation.level || additionalData.level || 100,
                session:
                  invitation.session || additionalData.session || "2026/2027",
                department: { connect: { id: invitation.departmentId } },
                cgpa: 0,
                hasPlacement: false,
                placementApproved: false,
              },
            });
            logger.info(
              `Student profile created successfully for user ${user.id}`,
            );
          } catch (studentError) {
            logger.error(
              `Failed to create student profile for user ${user.id}: ${studentError.message}`,
            );
            throw studentError;
          }
        }

        // Note: Supervisor profiles are already created by createUser
        // No need to create them again here

        // Mark invitation as accepted
        await tx.invitation.update({
          where: { id: invitation.id },
          data: { status: "accepted", acceptedAt: new Date() },
        });
      });
    } catch (profileSetupError) {
      // ROLLBACK: If profile creation fails, delete the base user so they aren't orphaned
      await prisma.user
        .delete({ where: { id: user.id } })
        .catch((cleanupError) => {
          logger.error(
            `CRITICAL: Failed to clean up orphaned user ${user.id}: ${cleanupError.message}`,
          );
        });

      throw new ApiError(
        500,
        `Profile setup failed. Please try again. Error: ${profileSetupError.message}`,
      );
    }

    // 4. Send welcome email (Non-blocking)
    try {
      await emailService.sendWelcome({
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      });
    } catch (emailError) {
      logger.error("Failed to send welcome email", emailError);
    }

    logger.info(
      `User account created for ${user.email} via invitation (${invitation.role})`,
    );

    try {
      await notificationService.createNotification({
        recipientId: invitation.invitedById,
        type: NOTIFICATION_TYPES.INVITE_ACCEPTED,
        title: "Invitation Accepted",
        message: `${user.firstName} ${user.lastName} accepted the invitation (${invitation.role}).`,
        priority: "medium",
        relatedModel: "Invitation",
        relatedId: invitation.id,
        createdById: user.id,
      });
    } catch (notifError) {
      logger.warn(`Failed to create invite-accepted notification: ${notifError.message}`);
    }

    try {
      await notificationService.createNotification({
        recipientId: user.id,
        type: NOTIFICATION_TYPES.INVITE_ACCEPTED,
        title: "Welcome Onboard",
        message: "Your invited account setup is complete.",
        priority: "low",
        relatedModel: "Invitation",
        relatedId: invitation.id,
        createdById: invitation.invitedById,
      });
    } catch (notifError) {
      logger.warn(`Failed to create invite-accepted confirmation: ${notifError.message}`);
    }

    return user;
  } catch (error) {
    logger.error(`Error completing setup: ${error.message}`);
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

/**
 * Clean up expired invitations
 */
const cleanupExpired = async () => {
  try {
    const result = await prisma.invitation.updateMany({
      where: {
        status: "pending",
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: "expired",
      },
    });

    logger.info(`Cleaned up ${result.count} expired invitations`);
    return result.count;
  } catch (error) {
    logger.error(`Error cleaning up expired invitations: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get invitation statistics
 */
const getStatistics = async (user) => {
  try {
    const where =
      user.role === USER_ROLES.COORDINATOR ? { invitedById: user.id } : {};

    const [total, pending, accepted, expired, cancelled] = await Promise.all([
      prisma.invitation.count({ where }),
      prisma.invitation.count({ where: { ...where, status: "pending" } }),
      prisma.invitation.count({ where: { ...where, status: "accepted" } }),
      prisma.invitation.count({ where: { ...where, status: "expired" } }),
      prisma.invitation.count({ where: { ...where, status: "cancelled" } }),
    ]);

    return {
      total,
      pending,
      accepted,
      expired,
      cancelled,
    };
  } catch (error) {
    logger.error(`Error getting statistics: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = {
  createInvitation,
  validateInvitationPermissions,
  getInvitations,
  getInvitationById,
  verifyToken,
  resendInvitation,
  cancelInvitation,
  completeSetup,
  cleanupExpired,
  getStatistics,
  generateToken,
};
