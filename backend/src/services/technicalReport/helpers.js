const reportInclude = {
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
  placement: {
    select: {
      id: true,
      companyName: true,
      status: true,
    },
  },
  reviewedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

const TECHNICAL_REPORT_FOLDER = "iitms/technical-reports";

module.exports = {
  reportInclude,
  TECHNICAL_REPORT_FOLDER,
};
