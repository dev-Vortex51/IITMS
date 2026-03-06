const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { USER_ROLES } = require("../../utils/constants");
const logger = require("../../utils/logger");
const { createSupervisorProfile } = require("./createSupervisorProfile");
const { autoLinkSupervisorToPlacements } = require("./autoLinkSupervisorToPlacements");

const prisma = getPrismaClient();

const createIndustrialSupervisor = async (
  supervisorData,
  creatorId,
  placementId = null,
) => {
  try {
    const {
      email,
      companyName,
      companyAddress,
      position,
      phone,
      yearsOfExperience,
      companyEmail,
      companyWebsite,
      companySector,
    } = supervisorData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { supervisor: true },
    });

    if (existingUser) {
      const result = await prisma.$transaction(async (tx) => {
        const existingProfile = await tx.supervisor.findFirst({
          where: { userId: existingUser.id, type: "industrial" },
        });

        let supervisorProfile;
        if (existingProfile) {
          supervisorProfile = existingProfile;
        } else {
          supervisorProfile = await createSupervisorProfile(
            existingUser.id,
            "industrial",
            { companyName, companyAddress, position, ...supervisorData },
            creatorId,
            tx,
          );
        }

        await autoLinkSupervisorToPlacements(supervisorProfile.id, email, tx);

        return { user: existingUser, supervisor: supervisorProfile };
      });

      logger.info(`Existing user ${email} mapped as industrial supervisor`);
      return result;
    }

    const invitationService = require("../invitationService");

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true, role: true, departmentId: true, email: true },
    });

    if (!creator) {
      throw new ApiError(404, "Creator user not found");
    }

    const invitation = await invitationService.createInvitation(creator, {
      email,
      role: USER_ROLES.INDUSTRIAL_SUPERVISOR,
      metadata: {
        companyName,
        companyAddress,
        position,
        yearsOfExperience,
        companyEmail,
        companyWebsite,
        companySector,
        placementId,
      },
    });

    logger.info(`Invitation created for industrial supervisor: ${email}`);

    return {
      user: null,
      supervisor: null,
      invitation,
      requiresSetup: true,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

module.exports = { createIndustrialSupervisor };
