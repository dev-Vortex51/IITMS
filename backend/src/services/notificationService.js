const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, NOTIFICATION_TYPES } = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");
const nodemailer = require("nodemailer");
const config = require("../config");

const prisma = getPrismaClient();

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
 * Create a single notification
 */
const createNotification = async (notificationData) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        recipientId: notificationData.recipient || notificationData.recipientId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority || "medium",
        relatedModel: notificationData.relatedModel,
        relatedId: notificationData.relatedId,
        actionLink: notificationData.actionLink,
        actionText: notificationData.actionText,
        createdById: notificationData.createdById,
      },
      include: {
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send email if configured
    if (emailTransporter && notificationData.sendEmail) {
      await sendEmailNotification(notification);
    }

    logger.info(`Notification created for user: ${notification.recipientId}`);

    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Create multiple notifications in bulk
 */
const createBulkNotifications = async (recipients, notificationData) => {
  try {
    const notifications = await prisma.notification.createMany({
      data: recipients.map((recipientId) => ({
        recipientId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority || "medium",
        relatedModel: notificationData.relatedModel,
        relatedId: notificationData.relatedId,
        actionLink: notificationData.actionLink,
        actionText: notificationData.actionText,
        createdById: notificationData.createdById,
      })),
    });

    logger.info(
      `Bulk notifications created for ${recipients.length} users: ${notifications.count} records`,
    );

    return notifications;
  } catch (error) {
    logger.error(`Error creating bulk notifications: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (notification) => {
  if (!emailTransporter) {
    logger.warn("Email transporter not configured");
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: notification.recipientId },
    });

    if (!user || !user.email) {
      logger.warn(`User ${notification.recipientId} not found or has no email`);
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

    // Update notification email status
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    logger.info(`Email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Get user notifications with filters and pagination
 */
const getUserNotifications = async (userId, filters = {}, pagination = {}) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);

    const where = { recipientId: userId };

    if (filters.unreadOnly) {
      where.isRead = false;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.notification.count({ where });

    return {
      notifications,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    logger.error(`Error fetching user notifications: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (notificationId) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Notification not found");
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  } catch (error) {
    logger.error(`Error marking notification as read: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { modifiedCount: result.count };
  } catch (error) {
    logger.error(`Error marking all notifications as read: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId) => {
  try {
    return await prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  } catch (error) {
    logger.error(`Error getting unread count: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Notification not found");
    }

    const deleted = await prisma.notification.delete({
      where: { id: notificationId },
    });

    return deleted;
  } catch (error) {
    logger.error(`Error deleting notification: ${error.message}`);
    throw handlePrismaError(error);
  }
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
