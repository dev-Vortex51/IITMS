const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

const getDepartmentsByFaculty = async (facultyId) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
    }

    const departments = await prisma.department.findMany({
      where: {
        facultyId,
        isActive: true,
      },
      include: {
        faculty: {
          select: { name: true, code: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return departments;
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getDepartmentsByFaculty };
