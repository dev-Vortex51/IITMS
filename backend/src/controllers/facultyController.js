const { facultyService } = require("../services");
const { asyncHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS, SUCCESS_MESSAGES } = require("../utils/constants");
const {
  formatResponse,
  parsePagination,
  buildPaginationMeta,
} = require("../utils/helpers");

const createFaculty = asyncHandler(async (req, res) => {
  const result = await facultyService.createFaculty(req.body, req.user);

  res
    .status(HTTP_STATUS.CREATED)
    .json(formatResponse(true, SUCCESS_MESSAGES.CREATED, result));
});

const getFaculties = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);

  const filters = {
    isActive: req.query.isActive,
    search: req.query.search,
  };

  const result = await facultyService.getFaculties(
    filters,
    { page, limit },
    req.user,
  );

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Faculties retrieved successfully",
        result.faculties,
        buildPaginationMeta(result, page, limit),
      ),
    );
});

const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await facultyService.getFacultyById(req.params.id, req.user);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Faculty retrieved successfully", faculty));
});

const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await facultyService.updateFaculty(
    req.params.id,
    req.body,
    req.user,
  );

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Faculty updated successfully", faculty));
});

const deleteFaculty = asyncHandler(async (req, res) => {
  await facultyService.deleteFaculty(req.params.id, req.user);

  res
    .status(HTTP_STATUS.OK)
    .json(formatResponse(true, "Faculty deleted successfully"));
});

const getFacultyDepartments = asyncHandler(async (req, res) => {
  const departments = await facultyService.getFacultyDepartments(req.params.id);

  res
    .status(HTTP_STATUS.OK)
    .json(
      formatResponse(
        true,
        "Faculty departments retrieved successfully",
        departments,
      ),
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
