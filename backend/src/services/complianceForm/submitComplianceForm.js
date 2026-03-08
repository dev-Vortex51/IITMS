const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { formInclude } = require("./helpers");

const prisma = getPrismaClient();

const submitComplianceForm = async (id, studentId) => {
  try {
    const existing = await prisma.complianceForm.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        documentPath: true,
        status: true,
      },
    });

    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Compliance form not found");
    }

    if (existing.studentId !== studentId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    if (!existing.documentPath) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Attach a form document before submission",
      );
    }

    if (existing.status === "approved") {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Form already approved");
    }

    return prisma.complianceForm.update({
      where: { id },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
      include: formInclude,
    });
  } catch (error) {
    logger.error(`Error submitting compliance form: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { submitComplianceForm };
