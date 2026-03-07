const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

const getSupervisorDashboard = async (supervisorId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        assignedStudents: {
          include: {
            student: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
                department: {
                  select: { name: true, code: true },
                },
                placements: {
                  select: {
                    companyName: true,
                    status: true,
                    industryPartner: {
                      select: { name: true },
                    },
                    createdAt: true,
                  },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const transformedAssignedStudents = supervisor.assignedStudents
      .map((assignment) => {
        const student = assignment.student;
        if (!student) return null;

        const latestPlacement =
          student.placements && student.placements.length > 0
            ? student.placements[0]
            : null;

        const currentPlacement = latestPlacement
          ? {
              ...latestPlacement,
              companyName:
                latestPlacement.industryPartner?.name ||
                latestPlacement.companyName,
            }
          : null;

        return {
          ...student,
          assignmentId: assignment.id,
          assignmentStatus: assignment.status,
          assignedAt: assignment.assignedAt,
          currentPlacement,
        };
      })
      .filter(Boolean);

    const studentIds = transformedAssignedStudents.map((student) => student.id);
    supervisor.assignedStudents = transformedAssignedStudents;

    const logbookWhere =
      supervisor.type === "academic" || supervisor.type === "departmental"
        ? { studentId: { in: studentIds }, status: "reviewed" }
        : { studentId: { in: studentIds }, status: "submitted" };

    const assessmentWhere = {
      studentId: { in: studentIds },
      status: "pending",
      supervisorId,
    };

    const [pendingLogbooks, pendingAssessments, totalLogbooks] =
      await Promise.all([
        prisma.logbook.findMany({
          where: logbookWhere,
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
        prisma.assessment.findMany({
          where: assessmentWhere,
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
        prisma.logbook.count({
          where: { studentId: { in: studentIds } },
        }),
      ]);

    return {
      supervisor,
      statistics: {
        assignedStudents: supervisor.assignedStudents.length,
        maxCapacity: supervisor.maxStudents,
        pendingLogbooks: pendingLogbooks.length,
        pendingAssessments: pendingAssessments.length,
        totalLogbooks,
      },
      pendingLogbooks,
      pendingAssessments,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getSupervisorDashboard };
