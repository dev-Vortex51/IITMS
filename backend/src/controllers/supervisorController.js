const { supervisorService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const getSupervisors = catchAsync(async (req, res) => {
  const filters = {
    type: req.query.type,
    department: req.query.department,
    available: req.query.available,
    companyName: req.query.companyName,
  };

  // If coordinator, filter by their department for departmental supervisors only
  // Industrial supervisors should be visible to all coordinators
  const { USER_ROLES } = require("../utils/constants");
  if (req.user.role === USER_ROLES.COORDINATOR && req.user.department) {
    filters.coordinatorDepartment = req.user.department;
  }

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await supervisorService.getSupervisors(filters, pagination);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Supervisors retrieved successfully",
    data: result.supervisors,
    pagination: result.pagination,
  });
});

const getSupervisorById = catchAsync(async (req, res) => {
  const supervisor = await supervisorService.getSupervisorById(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Supervisor retrieved successfully",
    data: supervisor,
  });
});

const updateSupervisor = catchAsync(async (req, res) => {
  const supervisor = await supervisorService.updateSupervisor(
    req.params.id,
    req.body,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Supervisor profile updated successfully",
    data: supervisor,
  });
});

const getAvailableSupervisors = catchAsync(async (req, res) => {
  const { type, department } = req.query;

  const supervisors = await supervisorService.getAvailableSupervisors(
    type,
    department,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Available supervisors retrieved successfully",
    data: supervisors,
  });
});

const getSupervisorSuggestions = catchAsync(async (req, res) => {
  const { studentId, type } = req.query;

  const supervisors = await supervisorService.suggestSupervisors(
    studentId,
    type,
    req.user,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Supervisor suggestions retrieved successfully",
    data: supervisors,
  });
});

const assignStudent = catchAsync(async (req, res) => {
  const { studentId } = req.body;

  const supervisor = await supervisorService.assignStudentToSupervisor(
    req.params.id,
    studentId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student assigned successfully",
    data: supervisor,
  });
});

const unassignStudent = catchAsync(async (req, res) => {
  const { studentId } = req.body;

  const supervisor = await supervisorService.unassignStudentFromSupervisor(
    req.params.id,
    studentId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student unassigned successfully",
    data: supervisor,
  });
});

const getSupervisorDashboard = catchAsync(async (req, res) => {
  const dashboard = await supervisorService.getSupervisorDashboard(
    req.params.id,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Dashboard data retrieved successfully",
    data: dashboard,
  });
});

const getSupervisorsByDepartment = catchAsync(async (req, res) => {
  const { type } = req.query;

  const supervisors = await supervisorService.getSupervisorsByDepartment(
    req.params.departmentId,
    type,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Supervisors retrieved successfully",
    data: supervisors,
  });
});

module.exports = {
  getSupervisors,
  getSupervisorById,
  updateSupervisor,
  getAvailableSupervisors,
  assignStudent,
  unassignStudent,
  getSupervisorDashboard,
  getSupervisorsByDepartment,
  getSupervisorSuggestions,
};
