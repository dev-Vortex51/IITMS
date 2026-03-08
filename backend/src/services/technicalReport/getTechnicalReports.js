const { getPrismaClient } = require("../../config/prisma");
const { parsePagination, buildPaginationMeta } = require("../../utils/helpers");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { reportInclude } = require("./helpers");

const prisma = getPrismaClient();

const getTechnicalReports = async (filters = {}, pagination = {}) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);

    const where = {};
    if (filters.student) {
      where.studentId = filters.student;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.department) {
      where.student = { departmentId: filters.department };
    }

    const [reports, total] = await Promise.all([
      prisma.technicalReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: reportInclude,
      }),
      prisma.technicalReport.count({ where }),
    ]);

    return {
      reports,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    logger.error(`Error getting technical reports: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getTechnicalReports };
