const logger = require("../../utils/logger");

const transformSupervisor = (supervisor) => {
  if (!supervisor.user || !supervisor.user.firstName) {
    logger.error(
      `[supervisorService] Supervisor with missing/incomplete user data: ${supervisor.id}`,
    );
  }

  const partner = supervisor.industryPartner;

  return {
    ...supervisor,
    name:
      supervisor.user && supervisor.user.firstName && supervisor.user.lastName
        ? `${supervisor.user.firstName} ${supervisor.user.lastName}`
        : "Unknown",
    email: supervisor.user?.email || null,
    phone: supervisor.user?.phone || null,
    companyName: partner?.name || supervisor.companyName || null,
    companyAddress: partner?.address || supervisor.companyAddress || null,
    students: supervisor.assignedStudents || [],
    isAvailable: supervisor.assignedStudents.length < supervisor.maxStudents,
  };
};

module.exports = { transformSupervisor };
