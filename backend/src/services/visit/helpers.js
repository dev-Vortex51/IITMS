const { USER_ROLES } = require("../../utils/constants");

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

module.exports = {
  visitInclude,
  canManageVisit,
};
