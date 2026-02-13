const { departmentService } = require("../services");
const { asyncHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS, SUCCESS_MESSAGES } = require("../utils/constants");
const {
  formatResponse,
  parsePagination,
  buildPaginationMeta,
} = require("../utils/helpers");

const createDepartment = asyncHandler(async (req, res) => {
  const result = await departmentService.createDepartment(req.body, req.user);

  res
    .status(HTTP_STATUS.CREATED)
    .json(formatResponse(true, SUCCESS_MESSAGES.CREATED, result));
});

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

  const result = await departmentService.getDepartments(
    filters,
    {
      page,
      limit,
    },
    req.user,
  );

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Departments retrieved successfully",
        result.departments,
        buildPaginationMeta(result.totalCount, page, limit),
      ),
    );
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(
    req.params.id,
    req.user,
  );

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(true, "Department retrieved successfully", department),
    );
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(
    req.params.id,
    req.body,
    req.user,
  );

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Department updated successfully", department));
});

const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id, req.user);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Department deleted successfully"));
});

const getDepartmentStudents = asyncHandler(async (req, res) => {
  const students = await departmentService.getDepartmentStudents(req.params.id);

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Department students retrieved successfully",
        students,
      ),
    );
});

const assignCoordinator = asyncHandler(async (req, res) => {
  const { coordinatorId } = req.body;

  const result = await departmentService.assignCoordinator(
    req.params.id,
    coordinatorId,
    req.user,
  );

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Coordinator assigned successfully", result));
});

const getAvailableCoordinators = asyncHandler(async (req, res) => {
  const coordinators = await departmentService.getCoordinatorsForDepartment(
    req.params.id,
  );

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Available coordinators retrieved successfully",
        coordinators,
      ),
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
