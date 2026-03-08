const { getPrismaClient } = require("../../config/prisma");
const { uploadToCloudinary } = require("../../utils/cloudinaryUpload");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { reportInclude, TECHNICAL_REPORT_FOLDER } = require("./helpers");

const prisma = getPrismaClient();

const updateTechnicalReport = async (id, studentId, reportData, file) => {
  try {
    const existing = await prisma.technicalReport.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        status: true,
      },
    });

    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Final technical report not found");
    }

    if (existing.studentId !== studentId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only update your own final technical report",
      );
    }

    if (existing.status === "approved") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Approved report cannot be updated",
      );
    }

    let uploadedFile = null;
    if (file) {
      uploadedFile = await uploadToCloudinary(file, {
        folder: TECHNICAL_REPORT_FOLDER,
      });
    }

    const report = await prisma.technicalReport.update({
      where: { id },
      data: {
        title: reportData.title !== undefined ? reportData.title || null : undefined,
        abstract:
          reportData.abstract !== undefined ? reportData.abstract || null : undefined,
        note: reportData.note !== undefined ? reportData.note || null : undefined,
        documentName: uploadedFile ? file.originalname : undefined,
        documentPath: uploadedFile ? uploadedFile.url : undefined,
        status: "draft",
        submittedAt: null,
        reviewedById: null,
        reviewedAt: null,
        reviewComment: null,
      },
      include: reportInclude,
    });

    return report;
  } catch (error) {
    logger.error(`Error updating technical report: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { updateTechnicalReport };
