const { USER_ROLES } = require("../../utils/constants");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const visitInclude = {
  student: {
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
      department: {
        select: { id: true, name: true, code: true },
      },
    },
  },
  supervisor: {
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  },
  placement: {
    select: {
      id: true,
      companyName: true,
      status: true,
    },
  },
};

const canManageVisit = (visit, user) => {
  if (!visit || !user) return false;

  if ([USER_ROLES.ADMIN, USER_ROLES.COORDINATOR].includes(user.role)) {
    return true;
  }

  if (user.role === USER_ROLES.ACADEMIC_SUPERVISOR) {
    return visit.supervisorId === user.supervisorProfile;
  }

  return false;
};

const validateVisitDate = (visitDate, placement) => {
  const now = new Date();
  if (visitDate <= now) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Visit date must be in the future",
    );
  }

  if (placement) {
    const start = new Date(placement.startDate).getTime();
    const end = new Date(placement.endDate).getTime();
    const visit = visitDate.getTime();
    if (visit < start || visit > end) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Visit date must fall within the student's placement window",
      );
    }
  }
};

const checkDuplicateVisit = async (prisma, studentId, visitDate) => {
  const dayStart = new Date(visitDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(visitDate);
  dayEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.visit.findFirst({
    where: {
      studentId,
      visitDate: { gte: dayStart, lte: dayEnd },
      status: { in: ["scheduled", "completed"] },
    },
  });

  if (existing) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "A visit is already scheduled or completed for this student on this date",
    );
  }
};

module.exports = {
  visitInclude,
  canManageVisit,
  validateVisitDate,
  checkDuplicateVisit,
};
