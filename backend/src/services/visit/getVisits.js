const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { parsePagination, buildPaginationMeta } = require("../../utils/helpers");
const logger = require("../../utils/logger");
const { visitInclude } = require("./helpers");

const prisma = getPrismaClient();

const getVisits = async (filters = {}, pagination = {}) => {
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
      where.student = {
        departmentId: filters.department,
      };
    }

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { visitDate: "desc" },
        include: visitInclude,
      }),
      prisma.visit.count({ where }),
    ]);

    return {
      visits,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    logger.error(`Error getting visits: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getVisits };
