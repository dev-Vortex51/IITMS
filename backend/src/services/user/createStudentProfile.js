const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");

const prisma = getPrismaClient();

const createStudentProfile = async (
  userId,
  studentData,
  creatorId,
  tx = prisma,
) => {
  try {
    return await tx.student.create({
      data: {
        user: { connect: { id: userId } },
        matricNumber: studentData.matricNumber,
        department: { connect: { id: studentData.department } },
        level: studentData.level,
        session: studentData.session,
        cgpa: studentData.cgpa,
        createdBy: creatorId,
      },
      include: { user: true, department: true },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

module.exports = { createStudentProfile };
