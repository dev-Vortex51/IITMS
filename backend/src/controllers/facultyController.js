/**
 * Faculty Controller
 * Handles faculty management HTTP requests
 */

const { facultyService } = require("../services");
const { asyncHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS, SUCCESS_MESSAGES } = require("../utils/constants");
const {
  formatResponse,
  parsePagination,
  buildPaginationMeta,
} = require("../utils/helpers");

/**
 * @route   POST /api/v1/faculties
 * @desc    Create a new faculty
 * @access  Private (Admin only)
 */
const createFaculty = asyncHandler(async (req, res) => {
  const result = await facultyService.createFaculty(req.body, req.user);

  res
    .status(HTTP_STATUS.CREATED)
    .json(formatResponse(true, SUCCESS_MESSAGES.CREATED, result));
});

/**
 * @route   GET /api/v1/faculties
 * @desc    Get all faculties with pagination and filtering
 * @access  Private (Admin, Coordinator)
 */
const getFaculties = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);

  const filters = {
    isActive: req.query.isActive,
    search: req.query.search,
  };

  const result = await facultyService.getFaculties(
    filters,
    { page, limit },
    req.user
  );

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Faculties retrieved successfully",
        result.faculties,
        buildPaginationMeta(result, page, limit)
      )
    );
});

/**
 * @route   GET /api/v1/faculties/:id
 * @desc    Get faculty by ID
 * @access  Private (Admin, Coordinator)
 */
const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await facultyService.getFacultyById(req.params.id, req.user);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Faculty retrieved successfully", faculty));
});

/**
 * @route   PUT /api/v1/faculties/:id
 * @desc    Update faculty
 * @access  Private (Admin only)
 */
const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await facultyService.updateFaculty(
    req.params.id,
    req.body,
    req.user
  );

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Faculty updated successfully", faculty));
});

/**
 * @route   DELETE /api/v1/faculties/:id
 * @desc    Delete (deactivate) faculty
 * @access  Private (Admin only)
 */
const deleteFaculty = asyncHandler(async (req, res) => {
  await facultyService.deleteFaculty(req.params.id, req.user);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Faculty deleted successfully"));
});

/**
 * @route   GET /api/v1/faculties/:id/departments
 * @desc    Get all departments in a faculty
 * @access  Private (Admin, Coordinator)
 */
const getFacultyDepartments = asyncHandler(async (req, res) => {
  const departments = await facultyService.getFacultyDepartments(req.params.id);

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Faculty departments retrieved successfully",
        departments
      )
    );
});

module.exports = {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getFacultyDepartments,
};
