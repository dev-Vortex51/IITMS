/**
 * Notification Service
 * Handles creation and management of notifications
 * Supports email notifications via NodeMailer
 */

const { Notification, User } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, NOTIFICATION_TYPES } = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");
const nodemailer = require("nodemailer");
const config = require("../config");

/**
 * Email transporter (initialized if email config is present)
 */
let emailTransporter = null;

if (config.email.user && config.email.password) {
  emailTransporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
}

/**
 * Create a notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (notificationData) => {
  const notification = await Notification.create(notificationData);

  // Send email if configured
  if (emailTransporter && notificationData.sendEmail) {
    await sendEmailNotification(notification);
  }

  logger.info(`Notification created for user: ${notificationData.recipient}`);

  return notification;
};

/**
 * Create bulk notifications
 * @param {Array} recipients - Array of user IDs
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Array>} Created notifications
 */
const createBulkNotifications = async (recipients, notificationData) => {
  const notifications = await Notification.createBulk(
    recipients,
    notificationData
  );

  logger.info(`Bulk notifications created for ${recipients.length} users`);

  return notifications;
};

/**
 * Send email notification
 * @param {Object} notification - Notification object
 * @returns {Promise<void>}
 */
const sendEmailNotification = async (notification) => {
  if (!emailTransporter) {
    logger.warn("Email transporter not configured");
    return;
  }

  try {
    const user = await User.findById(notification.recipient);

    if (!user || !user.email) {
      return;
    }

    const mailOptions = {
      from: config.email.from,
      to: user.email,
      subject: notification.title,
      html: `
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        ${
          notification.actionLink
            ? `<a href="${notification.actionLink}">${
                notification.actionText || "View Details"
              }</a>`
            : ""
        }
        <br/><br/>
        <p>This is an automated message from SIWES Management System.</p>
      `,
    };

    await emailTransporter.sendMail(mailOptions);

    notification.emailSent = true;
    notification.emailSentAt = Date.now();
    await notification.save();

    logger.info(`Email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Get user notifications
 * @param {ObjectId} userId - User ID
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Notifications with pagination
 */
const getUserNotifications = async (userId, filters = {}, pagination = {}) => {
  const { page, limit, skip } = parsePagination(pagination);

  const query = { recipient: userId };

  if (filters.unreadOnly) {
    query.isRead = false;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);

  return {
    notifications,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Mark notification as read
 * @param {ObjectId} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
const markAsRead = async (notificationId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Notification not found");
  }

  await notification.markAsRead();

  return notification;
};

/**
 * Mark all notifications as read
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} Update result
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.markAllAsRead(userId);

  return { modifiedCount: result.modifiedCount };
};

/**
 * Get unread notification count
 * @param {ObjectId} userId - User ID
 * @returns {Promise<number>} Count
 */
const getUnreadCount = async (userId) => {
  return await Notification.getCount(userId, true);
};

/**
 * Delete notification
 * @param {ObjectId} notificationId - Notification ID
 * @returns {Promise<Object>} Deleted notification
 */
const deleteNotification = async (notificationId) => {
  const notification = await Notification.findByIdAndDelete(notificationId);

  if (!notification) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Notification not found");
  }

  return notification;
};

module.exports = {
  createNotification,
  createBulkNotifications,
  sendEmailNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};
