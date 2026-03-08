const formInclude = {
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

const COMPLIANCE_FORM_FOLDER = "iitms/compliance-forms";

module.exports = {
  formInclude,
  COMPLIANCE_FORM_FOLDER,
};
