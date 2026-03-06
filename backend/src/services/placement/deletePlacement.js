const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, PLACEMENT_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const deletePlacement = async (placementId) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    if (placement.status === PLACEMENT_STATUS.APPROVED) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot delete approved placement. Use withdraw endpoint instead.",
      );
    }

    await prisma.placement.update({
      where: { id: placementId },
      data: { status: PLACEMENT_STATUS.WITHDRAWN },
    });

    logger.info(`Placement withdrawn: ${placementId}`);

    return await prisma.placement.findUnique({ where: { id: placementId } });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { deletePlacement };
