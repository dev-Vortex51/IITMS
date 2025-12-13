const { Invitation, User } = require("../models");
const { USER_ROLES } = require("../utils/constants");
const { ApiError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const emailService = require("../utils/emailService");

class InvitationService {
  /**
   * Create a new invitation
   * @param {Object} inviterUser - The user sending the invitation
   * @param {Object} invitationData - Invitation details
   * @returns {Promise<Object>} Created invitation
   */
  async createInvitation(inviterUser, invitationData) {
    const { email, role, metadata = {} } = invitationData;

    // Validate RBAC permissions
    this.validateInvitationPermissions(inviterUser.role, role);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, "A user with this email already exists");
    }

    // Check for pending invitations
    const pendingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (pendingInvitation) {
      throw new ApiError(
        400,
        "An active invitation already exists for this email"
      );
    }

    // Add department for coordinator-created users
    if (inviterUser.role === USER_ROLES.COORDINATOR && inviterUser.department) {
      metadata.department = inviterUser.department;
    }

    // Generate secure token
    const token = Invitation.generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await Invitation.create({
      email: email.toLowerCase(),
      role,
      token,
      expiresAt,
      invitedBy: inviterUser._id,
      invitedByRole: inviterUser.role,
      metadata,
      status: "pending",
    });

    await invitation.populate("invitedBy", "firstName lastName email");
    if (metadata.department) {
      await invitation.populate("metadata.department", "name code");
    }

    // Send magic link email
    try {
      await emailService.sendInvitation({
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        invitedBy: {
          firstName: inviterUser.firstName,
          lastName: inviterUser.lastName,
        },
      });
    } catch (emailError) {
      logger.error("Failed to send invitation email", emailError);
      // Don't fail the invitation creation if email fails
    }

    logger.info(
      `Invitation created for ${email} as ${role} by ${inviterUser.email}`
    );

    return invitation;
  }

  /**
   * Validate if inviter has permission to invite the specified role
   * @param {string} inviterRole - Role of the person inviting
   * @param {string} inviteeRole - Role being invited
   * @throws {ApiError} If permission denied
   */
  validateInvitationPermissions(inviterRole, inviteeRole) {
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
        `You do not have permission to invite users with role: ${inviteeRole}`
      );
    }
  }

  /**
   * Get all invitations (with optional filters)
   * @param {Object} user - Current user
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of invitations
   */
  async getInvitations(user, filters = {}) {
    const query = {};

    // Department-scoped access for coordinators
    if (user.role === USER_ROLES.COORDINATOR) {
      query.invitedBy = user._id;
    }

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.role) {
      query.role = filters.role;
    }
    if (filters.email) {
      query.email = { $regex: filters.email, $options: "i" };
    }

    const invitations = await Invitation.find(query)
      .populate("invitedBy", "firstName lastName email")
      .populate("metadata.department", "name code")
      .sort({ createdAt: -1 });

    return invitations;
  }

  /**
   * Get invitation by ID
   * @param {string} invitationId - Invitation ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Invitation details
   */
  async getInvitationById(invitationId, user) {
    const invitation = await Invitation.findById(invitationId)
      .populate("invitedBy", "firstName lastName email")
      .populate("metadata.department", "name code");

    if (!invitation) {
      throw new ApiError(404, "Invitation not found");
    }

    // Access control
    if (
      user.role === USER_ROLES.COORDINATOR &&
      invitation.invitedBy.toString() !== user._id.toString()
    ) {
      throw new ApiError(403, "Access denied to this invitation");
    }

    return invitation;
  }

  /**
   * Verify invitation token
   * @param {string} token - Invitation token
   * @returns {Promise<Object>} Invitation details if valid
   */
  async verifyToken(token) {
    const invitation = await Invitation.findOne({ token })
      .populate("metadata.department", "name code")
      .populate("metadata.faculty", "name code");

    if (!invitation) {
      throw new ApiError(404, "Invalid invitation token");
    }

    if (invitation.status !== "pending") {
      throw new ApiError(400, `This invitation has been ${invitation.status}`);
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      throw new ApiError(400, "This invitation has expired");
    }

    // Check if user already exists (in case created after invitation)
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      invitation.status = "cancelled";
      await invitation.save();
      throw new ApiError(400, "An account already exists for this email");
    }

    return invitation;
  }

  /**
   * Resend invitation email
   * @param {string} invitationId - Invitation ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Updated invitation
   */
  async resendInvitation(invitationId, user) {
    const invitation = await this.getInvitationById(invitationId, user);

    if (invitation.status !== "pending") {
      throw new ApiError(400, "Can only resend pending invitations");
    }

    if (!invitation.canResend()) {
      throw new ApiError(
        400,
        "Please wait at least 5 minutes before resending"
      );
    }

    // Update resend tracking
    invitation.resendCount += 1;
    invitation.lastResentAt = new Date();

    // Extend expiration by 7 more days
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await invitation.save();
    await invitation.populate("invitedBy", "firstName lastName email");

    // Send magic link email again
    try {
      await emailService.resendInvitation({
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        invitedBy: {
          firstName: invitation.invitedBy.firstName,
          lastName: invitation.invitedBy.lastName,
        },
      });
    } catch (emailError) {
      logger.error("Failed to resend invitation email", emailError);
      // Don't fail if email fails
    }

    logger.info(`Invitation resent for ${invitation.email} by ${user.email}`);

    return invitation;
  }

  /**
   * Cancel an invitation
   * @param {string} invitationId - Invitation ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Updated invitation
   */
  async cancelInvitation(invitationId, user) {
    const invitation = await this.getInvitationById(invitationId, user);

    if (invitation.status !== "pending") {
      throw new ApiError(400, "Can only cancel pending invitations");
    }

    invitation.status = "cancelled";
    invitation.cancelledAt = new Date();
    await invitation.save();

    logger.info(
      `Invitation cancelled for ${invitation.email} by ${user.email}`
    );

    return invitation;
  }

  /**
   * Complete first-time setup and create user account
   * @param {string} token - Invitation token
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user
   */
  async completeSetup(token, userData) {
    // Verify token
    const invitation = await this.verifyToken(token);

    const { firstName, lastName, password, phone, ...additionalData } =
      userData;

    // Validate required fields
    if (!firstName || !lastName || !password) {
      throw new ApiError(
        400,
        "First name, last name, and password are required"
      );
    }

    // Create user account
    const userPayload = {
      email: invitation.email,
      firstName,
      lastName,
      password,
      phone,
      role: invitation.role,
    };

    // Ensure department is present for coordinator
    if (invitation.role === USER_ROLES.COORDINATOR) {
      if (!invitation.metadata?.department) {
        throw new ApiError(
          400,
          "Department is required for coordinator account creation"
        );
      }
      userPayload.department = invitation.metadata.department;
    } else if (invitation.metadata?.department) {
      userPayload.department = invitation.metadata.department;
    }

    // Add additional role-specific data
    if (invitation.role === USER_ROLES.STUDENT) {
      userPayload.matricNumber = additionalData.matricNumber;
      userPayload.level = additionalData.level;
      userPayload.session = additionalData.session;
    }

    const user = await User.create(userPayload);

    // Assign coordinator to department if role is COORDINATOR
    if (
      invitation.role === USER_ROLES.COORDINATOR &&
      invitation.metadata?.department
    ) {
      const { Department } = require("../models");
      await Department.findByIdAndUpdate(
        invitation.metadata.department,
        { $addToSet: { coordinators: user._id } },
        { new: true }
      );
    }

    // Create role-specific profile if needed
    if (invitation.role === USER_ROLES.STUDENT) {
      const { Student } = require("../models");
      await Student.create({
        user: user._id,
        matricNumber: additionalData.matricNumber,
        level: additionalData.level,
        session: additionalData.session,
        department: invitation.metadata.department,
        cgpa: 0,
      });
    }

    if (
      invitation.role === USER_ROLES.ACADEMIC_SUPERVISOR ||
      invitation.role === USER_ROLES.INDUSTRIAL_SUPERVISOR
    ) {
      const { Supervisor } = require("../models");
      const supervisorData = {
        user: user._id,
        type:
          invitation.role === USER_ROLES.ACADEMIC_SUPERVISOR
            ? "academic"
            : "industrial",
        department: invitation.metadata.department,
        specialization: additionalData.specialization,
        maxStudents:
          invitation.role === USER_ROLES.ACADEMIC_SUPERVISOR ? 10 : 10,
      };

      // Add required fields for industrial supervisors
      if (invitation.role === USER_ROLES.INDUSTRIAL_SUPERVISOR) {
        supervisorData.companyName =
          additionalData.companyName || "Not Specified";
        supervisorData.companyAddress = additionalData.companyAddress;
        supervisorData.position = additionalData.position;
        supervisorData.yearsOfExperience = additionalData.yearsOfExperience;
      }

      await Supervisor.create(supervisorData);
    }

    // Mark invitation as accepted
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await invitation.save();

    // Send welcome email
    try {
      await emailService.sendWelcome({
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      });
    } catch (emailError) {
      logger.error("Failed to send welcome email", emailError);
      // Don't fail if email fails
    }

    logger.info(
      `User account created for ${user.email} via invitation (${invitation.role})`
    );

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  }

  /**
   * Cleanup expired invitations
   * @returns {Promise<number>} Number of expired invitations
   */
  async cleanupExpired() {
    const result = await Invitation.cleanupExpired();
    logger.info(`Cleaned up ${result.modifiedCount} expired invitations`);
    return result.modifiedCount;
  }

  /**
   * Get invitation statistics
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(user) {
    const query = {};

    if (user.role === USER_ROLES.COORDINATOR) {
      query.invitedBy = user._id;
    }

    const [total, pending, accepted, expired, cancelled] = await Promise.all([
      Invitation.countDocuments(query),
      Invitation.countDocuments({ ...query, status: "pending" }),
      Invitation.countDocuments({ ...query, status: "accepted" }),
      Invitation.countDocuments({ ...query, status: "expired" }),
      Invitation.countDocuments({ ...query, status: "cancelled" }),
    ]);

    return {
      total,
      pending,
      accepted,
      expired,
      cancelled,
    };
  }
}

module.exports = new InvitationService();
