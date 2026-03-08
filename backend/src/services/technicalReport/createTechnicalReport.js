const { getPrismaClient } = require("../../config/prisma");
const { uploadToCloudinary } = require("../../utils/cloudinaryUpload");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { reportInclude, TECHNICAL_REPORT_FOLDER } = require("./helpers");

const prisma = getPrismaClient();

const createTechnicalReport = async (studentId, reportData, file) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    const [approvedPlacement, existing] = await Promise.all([
      prisma.placement.findFirst({
        where: { studentId, status: "approved" },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      }),
      prisma.technicalReport.findUnique({
        where: { studentId },
        select: {
          id: true,
          status: true,
          documentName: true,
          documentPath: true,
        },
      }),
    ]);

    if (existing && existing.status === "approved") {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Final technical report has already been approved",
      );
    }

    let uploadedFile = null;
    if (file) {
      uploadedFile = await uploadToCloudinary(file, {
        folder: TECHNICAL_REPORT_FOLDER,
      });
    }

    const payload = {
      studentId,
      placementId: approvedPlacement?.id || null,
      title: reportData.title || null,
      abstract: reportData.abstract || null,
      note: reportData.note || null,
      status: "draft",
      submittedAt: null,
      reviewedById: null,
      reviewedAt: null,
      reviewComment: null,
      documentName: uploadedFile
        ? file.originalname
        : existing?.documentName || null,
      documentPath: uploadedFile ? uploadedFile.url : existing?.documentPath || null,
    };

    const report = existing
      ? await prisma.technicalReport.update({
          where: { id: existing.id },
          data: payload,
          include: reportInclude,
        })
      : await prisma.technicalReport.create({
          data: payload,
          include: reportInclude,
        });

    return report;
  } catch (error) {
    logger.error(`Error creating technical report: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { createTechnicalReport };
