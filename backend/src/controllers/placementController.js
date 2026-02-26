const { placementService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const createPlacement = catchAsync(async (req, res) => {
  // Student ID from authenticated user
  const studentId = req.user.studentProfile;

  const placement = await placementService.createPlacement(
    studentId,
    req.body,
    req.files,
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Placement application submitted successfully",
    data: placement,
  });
});

const getPlacements = catchAsync(async (req, res) => {
  const filters = {
    status: req.query.status,
    student: req.query.student,
    department: req.query.department,
  };

  // If coordinator, filter by their department
  const { USER_ROLES } = require("../utils/constants");
  if (req.user.role === USER_ROLES.COORDINATOR && req.user.department) {
    filters.department = req.user.department;
  }

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await placementService.getPlacements(filters, pagination);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placements retrieved successfully",
    data: result.placements,
    pagination: result.pagination,
  });
});

const getPlacementById = catchAsync(async (req, res) => {
  const placement = await placementService.getPlacementById(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement retrieved successfully",
    data: placement,
  });
});

const updatePlacement = catchAsync(async (req, res) => {
  const placement = await placementService.updatePlacement(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement updated successfully",
    data: placement,
  });
});

const reviewPlacement = catchAsync(async (req, res) => {
  const placement = await placementService.reviewPlacement(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement reviewed successfully",
    data: placement,
  });
});

const approvePlacement = catchAsync(async (req, res) => {
  const placement = await placementService.approvePlacement(
    req.params.id,
    req.body.remarks,
    req.user.id,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement approved successfully",
    data: placement,
  });
});

const rejectPlacement = catchAsync(async (req, res) => {
  const placement = await placementService.rejectPlacement(
    req.params.id,
    req.body.remarks,
    req.user.id,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement rejected successfully",
    data: placement,
  });
});

const assignIndustrialSupervisor = catchAsync(async (req, res) => {
  const placement = await placementService.assignIndustrialSupervisor(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Industrial supervisor assigned successfully",
    data: placement,
  });
});

const updatePlacementByCoordinator = catchAsync(async (req, res) => {
  const placement = await placementService.updatePlacementByCoordinator(
    req.params.id,
    req.body,
    req.user,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement updated successfully",
    data: placement,
  });
});

const withdrawPlacement = catchAsync(async (req, res) => {
  const placement = await placementService.withdrawPlacement(
    req.params.id,
    req.user.id,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement withdrawn successfully",
    data: placement,
  });
});

const deletePlacement = catchAsync(async (req, res) => {
  await placementService.deletePlacement(req.params.id, req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement withdrawn successfully",
  });
});

module.exports = {
  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  withdrawPlacement,
  reviewPlacement,
  approvePlacement,
  rejectPlacement,
  assignIndustrialSupervisor,
  updatePlacementByCoordinator,
  deletePlacement,
};
