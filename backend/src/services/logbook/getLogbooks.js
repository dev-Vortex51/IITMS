const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { parsePagination, buildPaginationMeta } = require("../../utils/helpers");
const { USER_ROLES, LOGBOOK_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getLogbooks = async (filters = {}, pagination = {}, user = null) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);

    const where = {};

    if (filters.student) where.studentId = filters.student;
    if (filters.status) where.status = filters.status;
    if (filters.weekNumber) where.weekNumber = filters.weekNumber;

    if (filters.department) {
      where.student = {
        departmentId: filters.department,
      };
    }

    // Departmental/academic supervisors only work on logbooks approved by industrial supervisors.
    if (
      user?.role === USER_ROLES.ACADEMIC_SUPERVISOR &&
      (user?.supervisorType === "departmental" ||
        user?.supervisorType === "academic")
    ) {
      where.status = {
        in: [LOGBOOK_STATUS.REVIEWED, LOGBOOK_STATUS.APPROVED],
      };
    }

    const include = {
      student: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      evidence: {
        select: {
          id: true,
          name: true,
          path: true,
          type: true,
          uploadedAt: true,
        },
      },
      reviews: {
        select: {
          id: true,
          supervisorType: true,
          comment: true,
          rating: true,
          status: true,
          reviewedAt: true,
        },
      },
    };

    // Student list views do not need department metadata on every row.
    if (user?.role === "student") {
      delete include.student.include.department;
    }

    const [logbooks, total] = await Promise.all([
      prisma.logbook.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: [{ weekNumber: "desc" }, { createdAt: "desc" }],
      }),
      prisma.logbook.count({ where }),
    ]);

    return {
      logbooks,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    logger.error(`Error getting logbooks: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getLogbooks };
