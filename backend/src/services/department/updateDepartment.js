const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

const updateDepartment = async (departmentId, updateData, updaterUser) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    if (updateData.faculty) {
      const facultyDoc = await prisma.faculty.findUnique({
        where: { id: updateData.faculty },
      });
      if (!facultyDoc || !facultyDoc.isActive) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          "Faculty not found or inactive",
        );
      }
    }

    if (updateData.name || updateData.code || updateData.faculty) {
      const where = {
        id: { not: departmentId },
        facultyId: updateData.faculty || department.facultyId,
        isActive: true,
      };

      const duplicateFilters = [];

      if (updateData.name) {
        duplicateFilters.push({ name: updateData.name });
      }
      if (updateData.code) {
        duplicateFilters.push({
          code: updateData.code.toUpperCase(),
        });
      }

      if (duplicateFilters.length > 0) {
        const existingDepartment = await prisma.department.findFirst({
          where: {
            AND: [where, { OR: duplicateFilters }],
          },
        });

        if (existingDepartment) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            "Department with this name or code already exists in the faculty",
          );
        }
      }
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: {
        name: updateData.name,
        description: updateData.description,
        code: updateData.code ? updateData.code.toUpperCase() : department.code,
        facultyId: updateData.faculty,
        updatedAt: new Date(),
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

    return updatedDepartment;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { updateDepartment };
