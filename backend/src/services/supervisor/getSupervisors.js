const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { parsePagination, buildPaginationMeta } = require("../../utils/helpers");
const { transformSupervisor } = require("./transformSupervisor");

const prisma = getPrismaClient();

const getSupervisors = async (filters = {}, pagination = {}) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);
    let where = { isActive: true };

    if (filters.type) {
      if (filters.type === "departmental" || filters.type === "academic") {
        where.type = { in: ["academic", "departmental"] };
      } else {
        where.type = filters.type;
      }
    }

    if (filters.companyName && filters.type === "industrial") {
      where.industryPartner = {
        name: { equals: filters.companyName, mode: "insensitive" },
      };
    }

    if (filters.department) {
      where.departmentId = filters.department;
    } else if (filters.coordinatorDepartment && !filters.type) {
      where.OR = [
        { type: "academic" },
        { type: "departmental" },
        { type: "academic", departmentId: null },
        { type: "departmental", departmentId: null },
        { type: "industrial" },
      ];
    }

    if (filters.available !== undefined) {
      const allSupervisors = await prisma.supervisor.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          department: {
            select: { name: true, code: true },
          },
          industryPartner: {
            select: { name: true, address: true },
          },
          assignedStudents: true,
        },
      });

      const availableSupervisors = allSupervisors.filter((s) => {
        const isAvailable = s.assignedStudents.length < s.maxStudents;
        return isAvailable === filters.available;
      });

      return {
        supervisors: availableSupervisors
          .slice(skip, skip + limit)
          .map(transformSupervisor),
        pagination: buildPaginationMeta(
          availableSupervisors.length,
          page,
          limit,
        ),
      };
    }

    const supervisors = await prisma.supervisor.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        department: {
          select: { name: true, code: true },
        },
        industryPartner: {
          select: { name: true, address: true },
        },
        assignedStudents: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.supervisor.count({ where });

    return {
      supervisors: supervisors.map(transformSupervisor),
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getSupervisors };
