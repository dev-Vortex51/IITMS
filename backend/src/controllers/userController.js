/**
 * User Controller
 * Handles user management HTTP requests
 */

const { userService } = require("../services");
const { asyncHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS, SUCCESS_MESSAGES } = require("../utils/constants");
const {
  formatResponse,
  parsePagination,
  buildPaginationMeta,
} = require("../utils/helpers");

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Private (Admin, Coordinator)
 */
const createUser = asyncHandler(async (req, res) => {
  const result = await userService.createUser(req.body, req.user);

  res
    .status(HTTP_STATUS.CREATED)
    .json(formatResponse(true, SUCCESS_MESSAGES.CREATED, result));
});

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin, Coordinator)
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const filters = {
    role: req.query.role,
    isActive: req.query.isActive,
    search: req.query.search,
  };

  const result = await userService.getUsers(filters, { page, limit });

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Users retrieved successfully",
        result.users,
        buildPaginationMeta(result.pagination.total, page, limit)
      )
    );
});

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin, Coordinator, Self)
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "User retrieved successfully", user));
});

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin, Coordinator)
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, SUCCESS_MESSAGES.UPDATED, user));
});

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete (deactivate) user
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, SUCCESS_MESSAGES.DELETED));
});

/**
 * @route   POST /api/v1/users/industrial-supervisor
 * @desc    Create industrial supervisor
 * @access  Private (Coordinator)
 */
const createIndustrialSupervisor = asyncHandler(async (req, res) => {
  const result = await userService.createIndustrialSupervisor(
    req.body,
    req.user._id
  );

  res
    .status(HTTP_STATUS.CREATED)
    .json(
      formatResponse(true, "Industrial supervisor created successfully", result)
    );
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createIndustrialSupervisor,
};
