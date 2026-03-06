const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

const createSupervisorProfile = async (
  userId,
  type,
  supervisorData,
  creatorId,
  tx = prisma,
) => {
  try {
    const supervisorPayload = {
      user: { connect: { id: userId } },
      type,
      position: supervisorData.position,
      qualification: supervisorData.qualification,
      yearsOfExperience: supervisorData.yearsOfExperience,
      specialization: supervisorData.specialization,
      maxStudents: supervisorData.maxStudents || 10,
    };

    if (type === "academic" && supervisorData.department) {
      supervisorPayload.department = {
        connect: { id: supervisorData.department },
      };
    } else if (type === "industrial") {
      if (!supervisorData.companyName) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Company name is required for industrial supervisors.",
        );
      }
      supervisorPayload.companyName = supervisorData.companyName;
      if (supervisorData.companyAddress)
        supervisorPayload.companyAddress = supervisorData.companyAddress;

      const partnerWhere = { name: supervisorData.companyName };
      if (supervisorData.companyEmail) {
        partnerWhere.email = supervisorData.companyEmail.toLowerCase();
      } else if (supervisorData.companyAddress) {
        partnerWhere.address = supervisorData.companyAddress;
      }

      const existingPartner = await tx.industryPartner.findFirst({
        where: partnerWhere,
      });

      if (existingPartner) {
        supervisorPayload.industryPartner = {
          connect: { id: existingPartner.id },
        };
      } else {
        supervisorPayload.industryPartner = {
          create: {
            name: supervisorData.companyName,
            address: supervisorData.companyAddress || null,
            email: supervisorData.companyEmail || null,
            phone: supervisorData.phone || null,
            website: supervisorData.companyWebsite || null,
            sector: supervisorData.companySector || null,
          },
        };
      }
    }

    return await tx.supervisor.create({
      data: supervisorPayload,
      include: { user: true, department: true, assignedStudents: true },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

module.exports = { createSupervisorProfile };
