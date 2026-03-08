const { getPrismaClient } = require("../../config/prisma");
const { uploadToCloudinary } = require("../../utils/cloudinaryUpload");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { formInclude, COMPLIANCE_FORM_FOLDER } = require("./helpers");

const prisma = getPrismaClient();

const createComplianceForm = async (studentId, formData, file) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    let placementId = null;
    const approvedPlacement = await prisma.placement.findFirst({
      where: { studentId, status: "approved" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (approvedPlacement) {
      placementId = approvedPlacement.id;
    }

    let uploadedFile = null;
    if (file) {
      uploadedFile = await uploadToCloudinary(file, {
        folder: COMPLIANCE_FORM_FOLDER,
      });
    }

    const existing = await prisma.complianceForm.findUnique({
      where: {
        studentId_formType: {
          studentId,
          formType: formData.formType,
        },
      },
      select: {
        id: true,
        status: true,
        documentName: true,
        documentPath: true,
      },
    });

    if (existing && existing.status === "approved") {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "This compliance form has already been approved",
      );
    }

    const payload = {
      studentId,
      placementId,
      formType: formData.formType,
      title: formData.title || null,
      note: formData.note || null,
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

    const record = existing
      ? await prisma.complianceForm.update({
          where: { id: existing.id },
          data: {
            ...payload,
            documentName: payload.documentName,
            documentPath: payload.documentPath,
          },
          include: formInclude,
        })
      : await prisma.complianceForm.create({
          data: payload,
          include: formInclude,
        });

    return record;
  } catch (error) {
    logger.error(`Error creating compliance form: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { createComplianceForm };
