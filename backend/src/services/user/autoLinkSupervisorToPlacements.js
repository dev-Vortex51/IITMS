const { getPrismaClient } = require("../../config/prisma");

const prisma = getPrismaClient();

const autoLinkSupervisorToPlacements = async (supervisorId, email, tx = prisma) => {
  const placements = await tx.placement.findMany({
    where: {
      supervisorEmail: email,
      status: { in: ["pending", "approved"] },
    },
    include: { student: true },
  });

  for (const placement of placements) {
    const student = placement.student;

    await tx.placement.update({
      where: { id: placement.id },
      data: {
        industrialSupervisorId: supervisorId,
      },
    });

    await tx.supervisorAssignment.upsert({
      where: {
        studentId_supervisorId_placementId: {
          studentId: student.id,
          supervisorId: supervisorId,
          placementId: placement.id,
        },
      },
      update: {
        status: "active",
        assignedAt: new Date(),
        revokedAt: null,
      },
      create: {
        studentId: student.id,
        supervisorId: supervisorId,
        placementId: placement.id,
        status: "active",
      },
    });

    if (placement.status === "approved" && !student.industrialSupervisorId) {
      await tx.student.update({
        where: { id: student.id },
        data: {
          industrialSupervisorId: supervisorId,
        },
      });
    }
  }
};

module.exports = { autoLinkSupervisorToPlacements };
