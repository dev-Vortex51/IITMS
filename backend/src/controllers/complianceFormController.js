const { complianceFormService } = require("../services");
const { USER_ROLES, HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const createComplianceForm = catchAsync(async (req, res) => {
  const form = await complianceFormService.createComplianceForm(
    req.user.studentProfile,
    req.body,
    req.file,
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Compliance form saved successfully",
    data: form,
  });
});

const updateComplianceForm = catchAsync(async (req, res) => {
  const form = await complianceFormService.updateComplianceForm(
    req.params.id,
    req.user.studentProfile,
    req.body,
    req.file,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Compliance form updated successfully",
    data: form,
  });
});

const getComplianceForms = catchAsync(async (req, res) => {
  const filters = {
    student: req.query.student,
    formType: req.query.formType,
    status: req.query.status,
    department: req.query.department,
  };

  if (req.user.role === USER_ROLES.STUDENT) {
    filters.student = req.user.studentProfile;
  }

  const coordinatorDepartmentId = req.user.departmentId || req.user.department;
  if (req.user.role === USER_ROLES.COORDINATOR && coordinatorDepartmentId) {
    filters.department = coordinatorDepartmentId;
  }

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await complianceFormService.getComplianceForms(filters, pagination);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Compliance forms retrieved successfully",
    data: result.forms,
    pagination: result.pagination,
  });
});

const getComplianceFormById = catchAsync(async (req, res) => {
  const form = await complianceFormService.getComplianceFormById(req.params.id, req.user);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Compliance form retrieved successfully",
    data: form,
  });
});

const submitComplianceForm = catchAsync(async (req, res) => {
  const form = await complianceFormService.submitComplianceForm(
    req.params.id,
    req.user.studentProfile,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Compliance form submitted successfully",
    data: form,
  });
});

const reviewComplianceForm = catchAsync(async (req, res) => {
  const form = await complianceFormService.reviewComplianceForm(
    req.params.id,
    req.body,
    req.user,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Compliance form reviewed successfully",
    data: form,
  });
});

const getComplianceRegistryTemplate = catchAsync(async (_req, res) => {
  const template = await complianceFormService.getComplianceRegistryTemplate();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Compliance form template retrieved successfully",
    data: template,
  });
});

module.exports = {
  createComplianceForm,
  updateComplianceForm,
  getComplianceForms,
  getComplianceFormById,
  submitComplianceForm,
  reviewComplianceForm,
  getComplianceRegistryTemplate,
};
