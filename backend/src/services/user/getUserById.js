const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

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

module.exports = { getUserById };
