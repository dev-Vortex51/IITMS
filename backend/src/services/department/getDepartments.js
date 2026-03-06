const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { USER_ROLES } = require("../../utils/constants");

const prisma = getPrismaClient();

const getDepartments = async (filters = {}, pagination = {}, user = null) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = {};

    if (user && user.role === USER_ROLES.COORDINATOR && user.departmentId) {
      where.id = user.departmentId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === "true" || filters.isActive === true;
    } else {
      where.isActive = true;
    }

    if (filters.faculty) {
      where.facultyId = filters.faculty;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        faculty: {
          select: { name: true, code: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        coordinators: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: {
            students: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: [{ faculty: { name: "asc" } }, { name: "asc" }],
      skip,
      take: Number(limit),
    });

    const departmentsWithCount = departments.map((dept) => ({
      ...dept,
      studentCount: dept._count.students,
    }));

    const totalCount = await prisma.department.count({ where });

    return {
      departments: departmentsWithCount,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getDepartments };
