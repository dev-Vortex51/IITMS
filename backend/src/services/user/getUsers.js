const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");

const prisma = getPrismaClient();

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

module.exports = { getUsers };
