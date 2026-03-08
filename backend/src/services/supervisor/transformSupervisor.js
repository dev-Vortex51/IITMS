const logger = require("../../utils/logger");

const transformSupervisor = (supervisor) => {
  if (!supervisor.user || !supervisor.user.firstName) {
    logger.error(
      `[supervisorService] Supervisor with missing/incomplete user data: ${supervisor.id}`,
    );
  }

  const partner = supervisor.industryPartner;
  const assignedStudents = supervisor.assignedStudents || [];
  const assignedCount =
    typeof supervisor?._count?.assignedStudents === "number"
      ? supervisor._count.assignedStudents
      : assignedStudents.length;

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
    students: assignedStudents,
    isAvailable: assignedCount < supervisor.maxStudents,
  };
};

module.exports = { transformSupervisor };
