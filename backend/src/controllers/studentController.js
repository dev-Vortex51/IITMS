const { studentService, placementService } = require("../services");
const userService = require("../services/userService");
const { HTTP_STATUS, USER_ROLES } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const resolveDepartmentId = (user) => {
  if (!user) return null;
  if (user.departmentId) return user.departmentId;
  if (user.department && typeof user.department === "object") {
    return user.department.id || null;
  }
  return user.department || null;
};

const getAllStudents = catchAsync(async (req, res) => {
  const logger = require("../utils/logger");
  logger.info(`getAllStudents called by ${req.user?.email || "unknown"}`);

  // Filter by coordinator department if applicable
  const filter = {};
  if (req.user.role === USER_ROLES.COORDINATOR) {
    const departmentId = resolveDepartmentId(req.user);
    if (departmentId) {
      filter.department = departmentId;
    }
  }

  const result = await studentService.getAllStudents(filter);
  logger.info(
    `getAllStudents returned ${
      Array.isArray(result) ? result.length : 0
    } records`,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "All students retrieved successfully",
    data: result,
  });
});

const getStudents = catchAsync(async (req, res) => {
  const filters = {};

  // If coordinator, only show students from their department
  if (req.user.role === USER_ROLES.COORDINATOR) {
    const departmentId = resolveDepartmentId(req.user);
    if (departmentId) {
      filters.department = departmentId;
    }
  } else if (req.query.department) {
    filters.department = req.query.department;
  }

  // Only add filters that are actually provided
  if (req.query.level) filters.level = req.query.level;
  if (req.query.session) filters.session = req.query.session;
  if (req.query.placementApproved !== undefined)
    filters.placementApproved = req.query.placementApproved;
  if (req.query.search) filters.search = req.query.search;

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await studentService.getStudents(
    filters,
    pagination,
    req.user,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Students retrieved successfully",
    data: result.students,
    pagination: result.pagination,
  });
});

const getStudentById = catchAsync(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student retrieved successfully",
    data: student,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student profile updated successfully",
    data: student,
  });
});

const getStudentDashboard = catchAsync(async (req, res) => {
  const dashboard = await studentService.getStudentDashboard(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Dashboard data retrieved successfully",
    data: dashboard,
  });
});

const assignSupervisor = catchAsync(async (req, res) => {
  const { supervisorId, type } = req.body;

  const student = await studentService.assignSupervisor(
    req.params.id,
    supervisorId,
    type,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `${type} supervisor assigned successfully`,
    data: student,
  });
});

const getStudentsByDepartment = catchAsync(async (req, res) => {
  const filters = {
    level: req.query.level,
    session: req.query.session,
  };

  const students = await studentService.getStudentsByDepartment(
    req.params.departmentId,
    filters,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Students retrieved successfully",
    data: students,
  });
});

const createStudent = catchAsync(async (req, res) => {
  const studentData = {
    ...req.body,
    role: USER_ROLES.STUDENT,
  };

  // If coordinator, use their department
  if (req.user.role === USER_ROLES.COORDINATOR) {
    const departmentId = resolveDepartmentId(req.user);
    if (departmentId) {
      studentData.department = departmentId;
    }
  }

  const result = await userService.createUser(studentData, req.user);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Student created successfully",
    data: result,
  });
});

const getStudentPlacement = catchAsync(async (req, res) => {
  const { id } = req.params;

  const placement = await placementService.getStudentPlacement(id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student placement retrieved successfully",
    data: placement,
  });
});

module.exports = {
  getAllStudents,
  getStudents,
  getStudentById,
  updateStudent,
  getStudentDashboard,
  assignSupervisor,
  getStudentsByDepartment,
  createStudent,
  getStudentPlacement,
};
