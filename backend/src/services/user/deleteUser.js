const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

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

module.exports = { deleteUser };
