/**
 * Supervisor Controller
 * HTTP request handlers for supervisor management
 */

const { supervisorService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

/**
 * @desc    Get all supervisors
 * @route   GET /api/v1/supervisors
 * @access  Private (Admin, Coordinator)
 */
const getSupervisors = catchAsync(async (req, res) => {
  const filters = {
    type: req.query.type,
    department: req.query.department,
    available: req.query.available,
  };

  // If coordinator, filter by their department for departmental supervisors only
  // Industrial supervisors should be visible to all coordinators
  const { USER_ROLES } = require("../utils/constants");
  if (req.user.role === USER_ROLES.COORDINATOR && req.user.department) {
    // Only apply department filter if specifically requesting departmental supervisors
    if (req.query.type === "departmental") {
      filters.department = req.user.department;
    }
    // For coordinators, pass the user's department for mixed queries
    filters.coordinatorDepartment = req.user.department;
  }

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await supervisorService.getSupervisors(filters, pagination);

  // Debug logging
  console.log("[supervisorController] User role:", req.user.role);
  console.log("[supervisorController] User department:", req.user.department);
  console.log("[supervisorController] Applied filters:", filters);
  console.log(
    "[supervisorController] Result count:",
    result.supervisors.length
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Supervisors retrieved successfully",
    data: result.supervisors,
    pagination: result.pagination,
  });
});

/**
 * @desc    Get supervisor by ID
 * @route   GET /api/v1/supervisors/:id
 * @access  Private
 */
const getSupervisorById = catchAsync(async (req, res) => {
  const supervisor = await supervisorService.getSupervisorById(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Supervisor retrieved successfully",
    data: supervisor,
  });
});

/**
 * @desc    Update supervisor profile
 * @route   PUT /api/v1/supervisors/:id
 * @access  Private (Supervisor, Coordinator, Admin)
 */
const updateSupervisor = catchAsync(async (req, res) => {
  const supervisor = await supervisorService.updateSupervisor(
    req.params.id,
    req.body
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Supervisor profile updated successfully",
    data: supervisor,
  });
});

/**
 * @desc    Get available supervisors
 * @route   GET /api/v1/supervisors/available
 * @access  Private (Coordinator, Admin)
 */
const getAvailableSupervisors = catchAsync(async (req, res) => {
  const { type, department } = req.query;

  const supervisors = await supervisorService.getAvailableSupervisors(
    type,
    department
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Available supervisors retrieved successfully",
    data: supervisors,
  });
});

/**
 * @desc    Assign student to supervisor
 * @route   POST /api/v1/supervisors/:id/assign-student
 * @access  Private (Coordinator, Admin)
 */
const assignStudent = catchAsync(async (req, res) => {
  const { studentId } = req.body;

  const supervisor = await supervisorService.assignStudentToSupervisor(
    req.params.id,
    studentId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student assigned successfully",
    data: supervisor,
  });
});

/**
 * @desc    Unassign student from supervisor
 * @route   POST /api/v1/supervisors/:id/unassign-student
 * @access  Private (Coordinator, Admin)
 */
const unassignStudent = catchAsync(async (req, res) => {
  const { studentId } = req.body;

  const supervisor = await supervisorService.unassignStudentFromSupervisor(
    req.params.id,
    studentId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student unassigned successfully",
    data: supervisor,
  });
});

/**
 * @desc    Get supervisor dashboard
 * @route   GET /api/v1/supervisors/:id/dashboard
 * @access  Private (Supervisor)
 */
const getSupervisorDashboard = catchAsync(async (req, res) => {
  const dashboard = await supervisorService.getSupervisorDashboard(
    req.params.id
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Dashboard data retrieved successfully",
    data: dashboard,
  });
});

/**
 * @desc    Get supervisors by department
 * @route   GET /api/v1/departments/:departmentId/supervisors
 * @access  Private (Coordinator, Admin)
 */
const getSupervisorsByDepartment = catchAsync(async (req, res) => {
  const { type } = req.query;

  const supervisors = await supervisorService.getSupervisorsByDepartment(
    req.params.departmentId,
    type
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
};
