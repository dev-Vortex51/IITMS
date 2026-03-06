const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const updateSupervisor = async (supervisorId, updateData) => {
  try {
    const allowedFields = [
      "specialization",
      "maxStudents",
      "isActive",
      "companyName",
      "companyAddress",
      "department",
    ];
    const filteredData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === "department") {
          filteredData.departmentId = updateData[field];
        } else {
          filteredData[field] = updateData[field];
        }
      }
    });

    let industryPartnerId = undefined;
    if (updateData.companyName || updateData.companyAddress) {
      const partnerWhere = { name: updateData.companyName || undefined };
      if (updateData.companyEmail) {
        partnerWhere.email = updateData.companyEmail.toLowerCase();
      } else if (updateData.companyAddress) {
        partnerWhere.address = updateData.companyAddress;
      }

      const existingPartner = await prisma.industryPartner.findFirst({
        where: partnerWhere,
      });

      if (existingPartner) {
        industryPartnerId = existingPartner.id;
      } else if (updateData.companyName) {
        const createdPartner = await prisma.industryPartner.create({
          data: {
            name: updateData.companyName,
            address: updateData.companyAddress || null,
            email: updateData.companyEmail || null,
            phone: updateData.companyPhone || null,
            website: updateData.companyWebsite || null,
            sector: updateData.companySector || null,
          },
        });
        industryPartnerId = createdPartner.id;
      }
    }

    if (industryPartnerId !== undefined) {
      filteredData.industryPartnerId = industryPartnerId;
    }

    const supervisor = await prisma.supervisor.update({
      where: { id: supervisorId },
      data: filteredData,
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    logger.info(`Supervisor updated: ${supervisorId}`);

    return supervisor;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { updateSupervisor };
