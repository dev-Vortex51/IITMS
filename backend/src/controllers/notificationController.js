const { notificationService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const getNotifications = catchAsync(async (req, res) => {
  const filters = {
    unreadOnly: req.query.unreadOnly === "true",
    type: req.query.type,
    priority: req.query.priority,
  };

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await notificationService.getUserNotifications(
    req.user.id,
    filters,
    pagination,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Notifications retrieved successfully",
    data: result.notifications,
    pagination: result.pagination,
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "All notifications marked as read",
    data: result,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  await notificationService.deleteNotification(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Unread count retrieved successfully",
    data: { count },
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
