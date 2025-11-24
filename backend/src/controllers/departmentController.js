/**
 * Department Controller
 * Handles department management HTTP requests
 */

const { departmentService } = require("../services");
const { asyncHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS, SUCCESS_MESSAGES } = require("../utils/constants");
const {
  formatResponse,
  parsePagination,
  buildPaginationMeta,
} = require("../utils/helpers");

/**
 * @route   POST /api/v1/departments
 * @desc    Create a new department
 * @access  Private (Admin only)
 */
const createDepartment = asyncHandler(async (req, res) => {
  const result = await departmentService.createDepartment(req.body, req.user);

  res
    .status(HTTP_STATUS.CREATED)
    .json(formatResponse(true, SUCCESS_MESSAGES.CREATED, result));
});

/**
 * @route   GET /api/v1/departments
 * @desc    Get all departments with pagination and filtering
 * @access  Private (Admin, Coordinator)
 */
const getDepartments = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);

  const filters = {};

  if (req.query.faculty) {
    filters.faculty = req.query.faculty;
  }

  if (req.query.isActive !== undefined) {
    filters.isActive = req.query.isActive;
  }

  if (req.query.search) {
    filters.search = req.query.search;
  }

  console.log("Department Controller - Filters:", filters);
  console.log("Department Controller - Pagination:", { page, limit });
  console.log("Department Controller - User:", req.user?.role);

  const result = await departmentService.getDepartments(
    filters,
    {
      page,
      limit,
    },
    req.user
  );

  console.log("Department Controller - Result:", {
    departmentCount: result.departments?.length,
    totalCount: result.totalCount,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Departments retrieved successfully",
        result.departments,
        buildPaginationMeta(result.totalCount, page, limit)
      )
    );
});

/**
 * @route   GET /api/v1/departments/:id
 * @desc    Get department by ID
 * @access  Private (Admin, Coordinator)
 */
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(
    req.params.id,
    req.user
  );

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(true, "Department retrieved successfully", department)
    );
});

/**
 * @route   PUT /api/v1/departments/:id
 * @desc    Update department
 * @access  Private (Admin only)
 */
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(
    req.params.id,
    req.body,
    req.user
  );

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Department updated successfully", department));
});

/**
 * @route   DELETE /api/v1/departments/:id
 * @desc    Delete (deactivate) department
 * @access  Private (Admin only)
 */
const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id, req.user);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Department deleted successfully"));
});

/**
 * @route   GET /api/v1/departments/:id/students
 * @desc    Get all students in a department
 * @access  Private (Admin, Coordinator)
 */
const getDepartmentStudents = asyncHandler(async (req, res) => {
  const students = await departmentService.getDepartmentStudents(req.params.id);

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Department students retrieved successfully",
        students
      )
    );
});

/**
 * @route   PATCH /api/v1/departments/:id/coordinator
 * @desc    Assign coordinator to department
 * @access  Private (Admin only)
 */
const assignCoordinator = asyncHandler(async (req, res) => {
  const { coordinatorId } = req.body;

  const result = await departmentService.assignCoordinator(
    req.params.id,
    coordinatorId,
    req.user
  );

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Coordinator assigned successfully", result));
});

/**
 * @route   GET /api/v1/departments/:id/available-coordinators
 * @desc    Get coordinators available for assignment to this department
 * @access  Private (Admin only)
 */
const getAvailableCoordinators = asyncHandler(async (req, res) => {
  const coordinators = await departmentService.getCoordinatorsForDepartment(
    req.params.id
  );

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Available coordinators retrieved successfully",
        coordinators
      )
    );
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentStudents,
  assignCoordinator,
  getAvailableCoordinators,
};
