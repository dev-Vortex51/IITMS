const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { parsePagination, buildPaginationMeta } = require("../../utils/helpers");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getEvaluations = async (filters = {}, pagination = {}) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);

    const where = {};
    if (filters.student) {
      where.studentId = filters.student;
    }
    if (filters.supervisor) {
      where.supervisorId = filters.supervisor;
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.department) {
      where.student = { departmentId: filters.department };
    }

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
          supervisor: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
        },
      }),
      prisma.evaluation.count({ where }),
    ]);

    return {
      evaluations,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    logger.error(`Error getting evaluations: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getEvaluations };
