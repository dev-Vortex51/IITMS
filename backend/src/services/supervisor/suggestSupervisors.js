const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");

const prisma = getPrismaClient();

const suggestSupervisors = async (studentId, type, user) => {
  try {
    if (!studentId || !type) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Student ID and type are required",
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        department: {
          include: { faculty: { select: { name: true, code: true } } },
        },
        placements: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            industryPartner: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    if (
      user &&
      user.role === USER_ROLES.COORDINATOR &&
      user.departmentId &&
      student.departmentId !== user.departmentId
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only fetch suggestions for students in your department",
      );
    }

    const studentFacultyId = student.department?.facultyId;

    if (type === "academic" || type === "departmental") {
      const supervisors = await prisma.supervisor.findMany({
        where: {
          isActive: true,
          type: { in: ["academic", "departmental"] },
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          department: {
            include: { faculty: { select: { name: true, code: true } } },
          },
          assignedStudents: true,
        },
      });

      const filtered = supervisors
        .filter((sup) => sup.assignedStudents.length < sup.maxStudents)
        .filter((sup) => {
          if (!studentFacultyId) return true;
          if (!sup.departmentId) return true;
          return sup.department.facultyId === studentFacultyId;
        })
        .map((sup) => {
          const assignedCount = sup.assignedStudents.length;
          const remaining = sup.maxStudents - assignedCount;
          const facultyMatched = sup.department?.facultyId === studentFacultyId;
          return {
            ...sup,
            name:
              sup.user && sup.user.firstName && sup.user.lastName
                ? `${sup.user.firstName} ${sup.user.lastName}`
                : "Unknown",
            email: sup.user?.email || null,
            phone: sup.user?.phone || null,
            suggestionReason: facultyMatched
              ? "Same faculty"
              : "Cross-department (no department set)",
            score: remaining + (facultyMatched ? 2 : 0),
          };
        })
        .sort((a, b) => b.score - a.score);

      return filtered;
    }

    if (type === "industrial") {
      let placement =
        student.placements && student.placements.length > 0
          ? student.placements[0]
          : null;
      if (!placement && studentId) {
        placement = await prisma.placement.findFirst({
          where: { studentId },
          orderBy: { createdAt: "desc" },
          include: {
            industryPartner: {
              select: { name: true },
            },
          },
        });
      }

      const companyName =
        placement?.industryPartner?.name || placement?.companyName;

      const supervisors = await prisma.supervisor.findMany({
        where: {
          isActive: true,
          type: "industrial",
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          industryPartner: {
            select: { name: true },
          },
          assignedStudents: true,
        },
      });

      const matches = supervisors
        .map((sup) => {
          const assignedCount = sup.assignedStudents.length;
          const remaining = sup.maxStudents - assignedCount;
          const supervisorCompany =
            sup.industryPartner?.name || sup.companyName;
          const companyMatched =
            companyName && supervisorCompany
              ? supervisorCompany.toLowerCase() === companyName.toLowerCase()
              : false;
          return {
            ...sup,
            name:
              sup.user && sup.user.firstName && sup.user.lastName
                ? `${sup.user.firstName} ${sup.user.lastName}`
                : "Unknown",
            email: sup.user?.email || null,
            phone: sup.user?.phone || null,
            suggestionReason: companyMatched
              ? `Existing supervisor for ${companyName}`
              : "Available industrial supervisor",
            score: remaining + (companyMatched ? 3 : 0),
            companyMatched,
          };
        })
        .filter((sup) => {
          if (companyName) {
            return sup.companyMatched && sup.score > 0;
          }
          return sup.score > 0;
        })
        .sort((a, b) => b.score - a.score);

      return matches;
    }

    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Unsupported supervisor type");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { suggestSupervisors };
