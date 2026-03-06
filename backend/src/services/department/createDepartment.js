const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

const createDepartment = async (departmentData, creatorUser) => {
  try {
    const { name, code, faculty, description } = departmentData;

    const facultyDoc = await prisma.faculty.findUnique({
      where: { id: faculty },
    });
    if (!facultyDoc || !facultyDoc.isActive) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Faculty not found or inactive",
      );
    }

    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [
          { name, facultyId: faculty },
          { code: code.toUpperCase(), facultyId: faculty },
        ],
        isActive: true,
      },
    });

    if (existingDepartment) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Department with this name or code already exists in the faculty",
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        code: code.toUpperCase(),
        facultyId: faculty,
        description,
        createdById: creatorUser.id,
      },
      include: {
        faculty: {
          select: { name: true, code: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return department;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { createDepartment };
