const { logbookService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const createLogbookEntry = catchAsync(async (req, res) => {
  const studentId = req.user.studentProfile;

  const logbook = await logbookService.createLogbookEntry(
    studentId,
    req.body,
    req.files || [],
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Logbook entry created successfully",
    data: logbook,
  });
});

const getLogbooks = catchAsync(async (req, res) => {
  const filters = {
    student: req.query.student,
    status: req.query.status,
    weekNumber: req.query.weekNumber,
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

  const result = await logbookService.getLogbooks(filters, pagination);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbooks retrieved successfully",
    data: result.logbooks,
    pagination: result.pagination,
  });
});

const getLogbookById = catchAsync(async (req, res) => {
  const logbook = await logbookService.getLogbookById(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbook retrieved successfully",
    data: logbook,
  });
});

const updateLogbookEntry = catchAsync(async (req, res) => {
  const logbook = await logbookService.updateLogbookEntry(
    req.params.id,
    req.body,
    req.user._id,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbook entry updated successfully",
    data: logbook,
  });
});

const submitLogbookEntry = catchAsync(async (req, res) => {
  const logbook = await logbookService.submitLogbookEntry(
    req.params.id,
    req.user._id,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbook entry submitted successfully",
    data: logbook,
  });
});

const reviewLogbook = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;
  const supervisorType = req.user.supervisorType; // From auth middleware

  console.log("Review logbook - User:", {
    userId: req.user._id,
    email: req.user.email,
    role: req.user.role,
    supervisorProfile: req.user.supervisorProfile,
    supervisorType: req.user.supervisorType,
  });

  const logbook = await logbookService.reviewLogbook(
    req.params.id,
    req.body,
    supervisorId,
    supervisorType,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbook reviewed successfully",
    data: logbook,
  });
});

const getLogbooksPendingReview = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const logbooks = await logbookService.getLogbooksPendingReview(supervisorId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Pending logbooks retrieved successfully",
    data: logbooks,
  });
});

const getStudentLogbookSummary = catchAsync(async (req, res) => {
  const summary = await logbookService.getStudentLogbookSummary(
    req.params.studentId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbook summary retrieved successfully",
    data: summary,
  });
});

const industrialReviewLogbook = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const logbook = await logbookService.industrialReviewLogbook(
    req.params.id,
    supervisorId,
    req.body,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Review submitted successfully",
    data: logbook,
  });
});

module.exports = {
  createLogbookEntry,
  getLogbooks,
  getLogbookById,
  updateLogbookEntry,
  submitLogbookEntry,
  reviewLogbook,
  getLogbooksPendingReview,
  getStudentLogbookSummary,
  industrialReviewLogbook,
};
