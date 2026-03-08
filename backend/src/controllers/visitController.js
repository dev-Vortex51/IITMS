const { visitService } = require("../services");
const { USER_ROLES, HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const createVisit = catchAsync(async (req, res) => {
  const visit = await visitService.createVisit(req.body, req.user.supervisorProfile);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Visit scheduled successfully",
    data: visit,
  });
});

const getVisits = catchAsync(async (req, res) => {
  const filters = {
    student: req.query.student,
    supervisor: req.query.supervisor,
    type: req.query.type,
    status: req.query.status,
    department: req.query.department,
  };

  if (req.user.role === USER_ROLES.ACADEMIC_SUPERVISOR) {
    filters.supervisor = req.user.supervisorProfile;
  }

  const coordinatorDepartmentId = req.user.departmentId || req.user.department;
  if (req.user.role === USER_ROLES.COORDINATOR && coordinatorDepartmentId) {
    filters.department = coordinatorDepartmentId;
  }

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await visitService.getVisits(filters, pagination);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Visits retrieved successfully",
    data: result.visits,
    pagination: result.pagination,
  });
});

const getVisitById = catchAsync(async (req, res) => {
  const visit = await visitService.getVisitById(req.params.id, req.user);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Visit retrieved successfully",
    data: visit,
  });
});

const updateVisit = catchAsync(async (req, res) => {
  const visit = await visitService.updateVisit(req.params.id, req.body, req.user);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Visit updated successfully",
    data: visit,
  });
});

const completeVisit = catchAsync(async (req, res) => {
  const visit = await visitService.completeVisit(req.params.id, req.body, req.user);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Visit completed successfully",
    data: visit,
  });
});

const cancelVisit = catchAsync(async (req, res) => {
  const visit = await visitService.cancelVisit(req.params.id, req.body, req.user);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Visit cancelled successfully",
    data: visit,
  });
});

module.exports = {
  createVisit,
  getVisits,
  getVisitById,
  updateVisit,
  completeVisit,
  cancelVisit,
};
