const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { parsePagination, buildPaginationMeta } = require("../../utils/helpers");

const prisma = getPrismaClient();

const getPlacements = async (filters = {}, pagination = {}) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);

    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.student) where.studentId = filters.student;

    if (filters.department) {
      const departmentId =
        typeof filters.department === "object"
          ? filters.department.id
          : filters.department;
      const students = await prisma.student.findMany({
        where: { departmentId },
        select: { id: true },
      });
      where.studentId = { in: students.map((s) => s.id) };
    }

    const placements = await prisma.placement.findMany({
      where,
      include: {
        student: {
          select: {
            matricNumber: true,
            id: true,
            departmentId: true,
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        industryPartner: {
          select: {
            name: true,
            address: true,
            email: true,
            phone: true,
            website: true,
            sector: true,
          },
        },
        industrialSupervisor: {
          select: {
            id: true,
            position: true,
            companyName: true,
            companyAddress: true,
            industryPartner: {
              select: {
                name: true,
                address: true,
                email: true,
                phone: true,
                website: true,
                sector: true,
              },
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.placement.count({ where });

    const { mergeCompanyFields } = require("./placementCompany");

    const transformedPlacements = placements.map((placement) => {
      const withCompany = mergeCompanyFields(placement);
      return {
        ...withCompany,
        student: {
          ...withCompany.student,
          name:
            withCompany.student?.user?.firstName &&
            withCompany.student?.user?.lastName
              ? `${withCompany.student.user.firstName} ${withCompany.student.user.lastName}`
              : "Unknown Student",
        },
      };
    });

    return {
      placements: transformedPlacements,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getPlacements };
