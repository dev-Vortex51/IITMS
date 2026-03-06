const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");
const { hashPassword } = require("../../utils/helpers");
const config = require("../../config");
const logger = require("../../utils/logger");
const notificationService = require("../notificationService");
const { createStudentProfile } = require("./createStudentProfile");
const { createSupervisorProfile } = require("./createSupervisorProfile");
const { autoLinkSupervisorToPlacements } = require("./autoLinkSupervisorToPlacements");

const prisma = getPrismaClient();

const createUser = async (userData, creatorUser) => {
  try {
    const { email, firstName, lastName, role, department, password } = userData;

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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "User with this email already exists",
      );
    }

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

    const resultUser = await prisma.$transaction(async (tx) => {
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

      if (role === USER_ROLES.COORDINATOR && department) {
        await tx.department.update({
          where: { id: department },
          data: { coordinators: { connect: { id: user.id } } },
        });
      }

      return user;
    });

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

module.exports = { createUser };
