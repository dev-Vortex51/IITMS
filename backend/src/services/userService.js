const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../utils/constants");
const { hashPassword } = require("../utils/helpers");
const config = require("../config");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");

const prisma = getPrismaClient();

/**
 * HELPER: Auto-link an industrial supervisor to their pending/approved placements
 * This is kept DRY so both creation methods can use it reliably.
 */
const autoLinkSupervisorToPlacements = async (supervisorId, email, tx) => {
  const placements = await tx.placement.findMany({
    where: {
      supervisorEmail: email,
      status: { in: ["pending", "approved"] },
    },
    include: { student: true },
  });

  for (const placement of placements) {
    const student = placement.student;

    // 1. Update placement with supervisor reference
    await tx.placement.update({
      where: { id: placement.id },
      data: {
        industrialSupervisorId: supervisorId,
      },
    });

    // 2. Add student to supervisor's assigned students
    await tx.supervisorAssignment.upsert({
      where: {
        studentId_supervisorId_placementId: {
          studentId: student.id,
          supervisorId: supervisorId,
          placementId: placement.id,
        },
      },
      update: {
        status: "active",
        assignedAt: new Date(),
        revokedAt: null,
      },
      create: {
        studentId: student.id,
        supervisorId: supervisorId,
        placementId: placement.id,
        status: "active",
      },
    });

    // 3. Update student record if placement is approved
    if (placement.status === "approved" && !student.industrialSupervisorId) {
      await tx.student.update({
        where: { id: student.id },
        data: {
          industrialSupervisorId: supervisorId,
        },
      });
    }
  }
};

/**
 * Create a new user with role-specific profile using a secure Transaction
 */
const createUser = async (userData, creatorUser) => {
  try {
    const { email, firstName, lastName, role, department, password } = userData;

    // Check permissions based on creator role
    if (creatorUser.role === USER_ROLES.ADMIN) {
      const allowedRoles = [
        USER_ROLES.FACULTY,
        USER_ROLES.DEPARTMENT,
        USER_ROLES.COORDINATOR,
        USER_ROLES.ACADEMIC_SUPERVISOR,
      ];
      if (!allowedRoles.includes(role)) {
        const errorMsg =
          role === USER_ROLES.STUDENT
            ? "Only coordinators can create student accounts. Please use a coordinator to invite students."
            : `Admin cannot create users with role: ${role}`;
        throw new ApiError(HTTP_STATUS.FORBIDDEN, errorMsg);
      }
    } else if (creatorUser.role === USER_ROLES.COORDINATOR) {
      const allowedRoles = [
        USER_ROLES.STUDENT,
        USER_ROLES.INDUSTRIAL_SUPERVISOR,
      ];
      if (!allowedRoles.includes(role)) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Coordinator cannot create users with role: ${role}`,
        );
      }
    } else {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to create users",
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "User with this email already exists",
      );
    }

    // Validate department/faculty requirements
    if ([USER_ROLES.STUDENT, USER_ROLES.COORDINATOR].includes(role)) {
      if (!department)
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Department is required for this role",
        );
      const deptExists = await prisma.department.findUnique({
        where: { id: department },
      });
      if (!deptExists)
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    if (role === USER_ROLES.ACADEMIC_SUPERVISOR && department) {
      const deptExists = await prisma.department.findUnique({
        where: { id: department },
      });
      if (!deptExists)
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    const userPassword = password || config.password.default;
    const hashedPassword = await hashPassword(userPassword);

    // ==========================================
    // TRANSACTION: Prevents Ghost Users
    // ==========================================
    const resultUser = await prisma.$transaction(async (tx) => {
      // 1. Create Base User
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          role,
          password: hashedPassword,
          passwordResetRequired: true,
          phone: userData.phone,
          address: userData.address,
          department: [USER_ROLES.COORDINATOR, USER_ROLES.STUDENT].includes(
            role,
          )
            ? { connect: { id: department } }
            : undefined,
        },
        include: { department: true },
      });

      // 2. Create Role Profiles (skip for students during invitations - handled by invitationService)
      // Only create profile if it's not a student role, or if student data is complete
      const isStudentWithCompleteData =
        role === USER_ROLES.STUDENT &&
        userData.matricNumber &&
        userData.level &&
        userData.session;

      if (isStudentWithCompleteData) {
        await createStudentProfile(user.id, userData, creatorUser.id, tx);
      } else if (role === USER_ROLES.ACADEMIC_SUPERVISOR) {
        await createSupervisorProfile(
          user.id,
          "academic",
          {
            ...userData,
            department: userData.department || department,
            maxStudents: 10,
          },
          creatorUser.id,
          tx,
        );
      } else if (role === USER_ROLES.INDUSTRIAL_SUPERVISOR) {
        const supervisor = await createSupervisorProfile(
          user.id,
          "industrial",
          userData,
          creatorUser.id,
          tx,
        );
        await autoLinkSupervisorToPlacements(supervisor.id, email, tx);
      }

      // 3. Add coordinator to department if applicable
      if (role === USER_ROLES.COORDINATOR && department) {
        await tx.department.update({
          where: { id: department },
          data: { coordinators: { connect: { id: user.id } } },
        });
      }

      return user;
    });

    // Send Notification (Outside the transaction so email failures don't roll back the DB)
    await notificationService.createNotification({
      recipient: resultUser.id,
      type: "account_created",
      title: "Account Created",
      message: `Your account has been created. Email: ${email}, Password: ${userPassword}. Please login and change your password.`,
      priority: "high",
      createdBy: creatorUser.id,
    });

    logger.info(`User created: ${resultUser.email} by ${creatorUser.email}`);

    return {
      user: {
        id: resultUser.id,
        email: resultUser.email,
        firstName: resultUser.firstName,
        lastName: resultUser.lastName,
        role: resultUser.role,
        phone: resultUser.phone,
        isActive: resultUser.isActive,
      },
      defaultPassword: userPassword,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

/**
 * Create an industrial supervisor - standalone function for auto-creation during placement approval
 * Now creates an invitation instead of directly creating a user with default password
 */
const createIndustrialSupervisor = async (
  supervisorData,
  creatorId,
  placementId = null,
) => {
  try {
    const {
      email,
      firstName,
      lastName,
      companyName,
      companyAddress,
      position,
      phone,
      yearsOfExperience,
    } = supervisorData;

    let isNewUser = false;
    let finalUser;
    let supervisor;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { supervisor: true },
    });

    if (existingUser) {
      // User already exists - create/link the supervisor profile
      const result = await prisma.$transaction(async (tx) => {
        const existingProfile = await tx.supervisor.findFirst({
          where: { userId: existingUser.id, type: "industrial" },
        });

        let supervisorProfile;
        if (existingProfile) {
          supervisorProfile = existingProfile;
        } else {
          supervisorProfile = await createSupervisorProfile(
            existingUser.id,
            "industrial",
            { companyName, companyAddress, position, ...supervisorData },
            creatorId,
            tx,
          );
        }

        // Link supervisor to placements
        await autoLinkSupervisorToPlacements(supervisorProfile.id, email, tx);

        return { user: existingUser, supervisor: supervisorProfile };
      });

      logger.info(`Existing user ${email} mapped as industrial supervisor`);
      return result;
    } else {
      // User doesn't exist - create an invitation instead of creating user directly
      const invitationService = require("./invitationService");

      // Get the creator user details for the invitation
      const creator = await prisma.user.findUnique({
        where: { id: creatorId },
        select: { id: true, role: true, departmentId: true, email: true },
      });

      if (!creator) {
        throw new ApiError(404, "Creator user not found");
      }

      const invitation = await invitationService.createInvitation(creator, {
        email,
        role: USER_ROLES.INDUSTRIAL_SUPERVISOR,
        metadata: {
          companyName,
          companyAddress,
          position,
          yearsOfExperience,
          placementId, // Link to the placement this supervisor is for
        },
      });

      logger.info(`Invitation created for industrial supervisor: ${email}`);

      // Return null for user and supervisor since they haven't been created yet
      // The calling code should handle this gracefully
      return {
        user: null,
        supervisor: null,
        invitation,
        requiresSetup: true,
      };
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

/**
 * Create a student profile (Accepts an optional transaction client `tx`)
 */
const createStudentProfile = async (
  userId,
  studentData,
  creatorId,
  tx = prisma,
) => {
  try {
    return await tx.student.create({
      data: {
        user: { connect: { id: userId } },
        matricNumber: studentData.matricNumber,
        department: { connect: { id: studentData.department } },
        level: studentData.level,
        session: studentData.session,
        cgpa: studentData.cgpa,
        createdBy: creatorId,
      },
      include: { user: true, department: true },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

/**
 * Create a supervisor profile (Accepts an optional transaction client `tx`)
 */
const createSupervisorProfile = async (
  userId,
  type,
  supervisorData,
  creatorId,
  tx = prisma,
) => {
  try {
    const supervisorPayload = {
      user: { connect: { id: userId } },
      type,
      position: supervisorData.position,
      qualification: supervisorData.qualification,
      yearsOfExperience: supervisorData.yearsOfExperience,
      specialization: supervisorData.specialization,
      maxStudents: supervisorData.maxStudents || 10,
    };

    if (type === "academic" && supervisorData.department) {
      supervisorPayload.department = {
        connect: { id: supervisorData.department },
      };
    } else if (type === "industrial") {
      if (!supervisorData.companyName) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Company name is required for industrial supervisors.",
        );
      }
      supervisorPayload.companyName = supervisorData.companyName;
      if (supervisorData.companyAddress)
        supervisorPayload.companyAddress = supervisorData.companyAddress;
    }

    return await tx.supervisor.create({
      data: supervisorPayload,
      include: { user: true, department: true, assignedStudents: true },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

/**
 * Get list of users with filtering and pagination
 */
const getUsers = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await prisma.user.count({ where });

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
        studentProfile: true,
        supervisorProfile: true,
        createdInvitations: true,
      },
    });

    if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

/**
 * Update user information
 */
const updateUser = async (userId, updateData) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "isActive",
    ];
    const filteredData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined)
        filteredData[field] = updateData[field];
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: filteredData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        isActive: true,
        updatedAt: true,
      },
    });

    logger.info(`User updated: ${user.email}`);
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

/**
 * Delete (deactivate) user
 */
const deleteUser = async (userId) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true, updatedAt: true },
    });

    logger.info(`User deactivated: ${user.email}`);
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

module.exports = {
  createUser,
  createStudentProfile,
  createSupervisorProfile,
  createIndustrialSupervisor,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
