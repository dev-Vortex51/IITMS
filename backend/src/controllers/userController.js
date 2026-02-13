const { userService } = require("../services");
const { asyncHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS, SUCCESS_MESSAGES } = require("../utils/constants");
const {
  formatResponse,
  parsePagination,
  buildPaginationMeta,
} = require("../utils/helpers");

const createUser = asyncHandler(async (req, res) => {
  const result = await userService.createUser(req.body, req.user);

  res
    .status(HTTP_STATUS.CREATED)
    .json(formatResponse(true, SUCCESS_MESSAGES.CREATED, result));
});

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
        buildPaginationMeta(result.pagination.total, page, limit),
      ),
    );
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "User retrieved successfully", user));
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, SUCCESS_MESSAGES.UPDATED, user));
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, SUCCESS_MESSAGES.DELETED));
});

const createIndustrialSupervisor = asyncHandler(async (req, res) => {
  const result = await userService.createIndustrialSupervisor(
    req.body,
    req.user._id,
  );

  res
    .status(HTTP_STATUS.CREATED)
    .json(
      formatResponse(
        true,
        "Industrial supervisor created successfully",
        result,
      ),
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
