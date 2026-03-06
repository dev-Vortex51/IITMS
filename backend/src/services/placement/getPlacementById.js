const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

const getPlacementById = async (placementId) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: {
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
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    const { mergeCompanyFields } = require("./placementCompany");
    return mergeCompanyFields(placement);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getPlacementById };
