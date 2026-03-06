const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

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

module.exports = { updateUser };
