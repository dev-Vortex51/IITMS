/**
 * Student Controller
 * HTTP request handlers for student management
 */

const { studentService } = require("../services");
const userService = require("../services/userService");
const { HTTP_STATUS, USER_ROLES } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");
const Placement = require("../models/Placement");

/**
 * @desc    Get all students (no filters, for stats)
 * @route   GET /api/v1/students/all
 * @access  Private (Admin, Coordinator)
 */
const getAllStudents = catchAsync(async (req, res) => {
  const logger = require("../utils/logger");
  logger.info(`getAllStudents called by ${req.user?.email || "unknown"}`);

  // Filter by coordinator department if applicable
  const filter = {};
  if (req.user.role === USER_ROLES.COORDINATOR && req.user.department) {
    filter.department = req.user.department;
  }

  const result = await studentService.getAllStudents(filter);
  logger.info(
    `getAllStudents returned ${
      Array.isArray(result) ? result.length : 0
    } records`
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "All students retrieved successfully",
    data: result,
  });
});

/**
 * @desc    Get all students
 * @route   GET /api/v1/students
 * @access  Private (Admin, Coordinator)
 */
const getStudents = catchAsync(async (req, res) => {
  const filters = {};

  // If coordinator, only show students from their department
  if (req.user.role === USER_ROLES.COORDINATOR && req.user.department) {
    filters.department = req.user.department;
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
    req.user
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Students retrieved successfully",
    data: result.students,
    pagination: result.pagination,
  });
});

/**
 * @desc    Get student by ID
 * @route   GET /api/v1/students/:id
 * @access  Private
 */
const getStudentById = catchAsync(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student retrieved successfully",
    data: student,
  });
});

/**
 * @desc    Update student profile
 * @route   PUT /api/v1/students/:id
 * @access  Private (Student, Coordinator, Admin)
 */
const updateStudent = catchAsync(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student profile updated successfully",
    data: student,
  });
});

/**
 * @desc    Get student dashboard
 * @route   GET /api/v1/students/:id/dashboard
 * @access  Private (Student)
 */
const getStudentDashboard = catchAsync(async (req, res) => {
  const dashboard = await studentService.getStudentDashboard(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Dashboard data retrieved successfully",
    data: dashboard,
  });
});

/**
 * @desc    Assign supervisor to student
 * @route   POST /api/v1/students/:id/assign-supervisor
 * @access  Private (Coordinator, Admin)
 */
const assignSupervisor = catchAsync(async (req, res) => {
  const { supervisorId, type } = req.body;

  const student = await studentService.assignSupervisor(
    req.params.id,
    supervisorId,
    type
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `${type} supervisor assigned successfully`,
    data: student,
  });
});

/**
 * @desc    Get students by department
 * @route   GET /api/v1/departments/:departmentId/students
 * @access  Private (Coordinator, Admin)
 */
const getStudentsByDepartment = catchAsync(async (req, res) => {
  const filters = {
    level: req.query.level,
    session: req.query.session,
  };

  const students = await studentService.getStudentsByDepartment(
    req.params.departmentId,
    filters
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Students retrieved successfully",
    data: students,
  });
});

/**
 * @desc    Create a new student
 * @route   POST /api/v1/students
 * @access  Private (Coordinator, Admin)
 */
const createStudent = catchAsync(async (req, res) => {
  const studentData = {
    ...req.body,
    role: USER_ROLES.STUDENT,
  };

  // If coordinator, use their department
  if (req.user.role === USER_ROLES.COORDINATOR) {
    studentData.department = req.user.department;
  }

  const result = await userService.createUser(studentData, req.user);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Student created successfully",
    data: result,
  });
});

/**
 * @desc    Get student placement
 * @route   GET /api/v1/students/:id/placement
 * @access  Private (Student (self), Admin, Coordinator)
 */
const getStudentPlacement = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Find the student's most recent placement (sorted by creation date)
  const placement = await Placement.findOne({ student: id })
    .populate("industrialSupervisor", "firstName lastName email phone")
    .populate("reviewedBy", "firstName lastName email")
    .sort({ createdAt: -1 }); // Get the most recent placement

  if (!placement) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: "No placement found for this student",
      data: null,
    });
  }

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
