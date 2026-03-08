const { getPrismaClient } = require("../../config/prisma");
const { parsePagination, buildPaginationMeta } = require("../../utils/helpers");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { formInclude } = require("./helpers");

const prisma = getPrismaClient();

const getComplianceForms = async (filters = {}, pagination = {}) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);

    const where = {};
    if (filters.student) {
      where.studentId = filters.student;
    }
    if (filters.formType) {
      where.formType = filters.formType;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.department) {
      where.student = { departmentId: filters.department };
    }

    const [forms, total] = await Promise.all([
      prisma.complianceForm.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: formInclude,
      }),
      prisma.complianceForm.count({ where }),
    ]);

    return {
      forms,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    logger.error(`Error getting compliance forms: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getComplianceForms };
