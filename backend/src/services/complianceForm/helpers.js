const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

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

const getComplianceFormDelegate = (prisma) => {
  const delegate = prisma?.complianceForm;
  if (!delegate) {
    throw new ApiError(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      "Compliance forms module is not ready in this deployment. Run Prisma generate and redeploy backend.",
    );
  }
  return delegate;
};

module.exports = {
  formInclude,
  COMPLIANCE_FORM_FOLDER,
  getComplianceFormDelegate,
};
