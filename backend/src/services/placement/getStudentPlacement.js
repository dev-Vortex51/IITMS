const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

const getStudentPlacement = async (studentId) => {
  try {
    const include = {
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
      student: {
        select: { matricNumber: true },
      },
    };

    // Prefer the latest approved placement because downstream workflows
    // (logbook week derivation, attendance) require approved dates.
    const approvedPlacement = await prisma.placement.findFirst({
      where: { studentId, status: "approved" },
      orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
      include,
    });

    const placement =
      approvedPlacement ||
      (await prisma.placement.findFirst({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        include,
      }));

    if (!placement) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "No placement found for this student",
      );
    }

    const { mergeCompanyFields } = require("./placementCompany");
    return mergeCompanyFields(placement);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getStudentPlacement };
