const { getPrismaClient } = require("../../config/prisma");
const { uploadToCloudinary } = require("../../utils/cloudinaryUpload");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const {
  formInclude,
  COMPLIANCE_FORM_FOLDER,
  getComplianceFormDelegate,
} = require("./helpers");

const prisma = getPrismaClient();

const updateComplianceForm = async (id, studentId, formData, file) => {
  try {
    const complianceForm = getComplianceFormDelegate(prisma);
    const existing = await complianceForm.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        status: true,
      },
    });

    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Compliance form not found");
    }

    if (existing.studentId !== studentId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only update your own compliance forms",
      );
    }

    if (existing.status === "approved") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Approved form cannot be updated",
      );
    }

    let uploadedFile = null;
    if (file) {
      uploadedFile = await uploadToCloudinary(file, {
        folder: COMPLIANCE_FORM_FOLDER,
      });
    }

    const updated = await complianceForm.update({
      where: { id },
      data: {
        title: formData.title !== undefined ? formData.title || null : undefined,
        note: formData.note !== undefined ? formData.note || null : undefined,
        documentName: uploadedFile ? file.originalname : undefined,
        documentPath: uploadedFile ? uploadedFile.url : undefined,
        status: "draft",
        submittedAt: null,
        reviewedById: null,
        reviewedAt: null,
        reviewComment: null,
      },
      include: formInclude,
    });

    return updated;
  } catch (error) {
    logger.error(`Error updating compliance form: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { updateComplianceForm };
