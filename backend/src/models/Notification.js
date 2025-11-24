/**
 * Notification Model
 * Represents in-app notifications for users
 * Supports different notification types and priority levels
 */

const mongoose = require("mongoose");
const {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
} = require("../utils/constants");

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },

    // Notification Content
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: [true, "Notification type is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 500,
    },

    // Priority
    priority: {
      type: String,
      enum: Object.values(NOTIFICATION_PRIORITY),
      default: NOTIFICATION_PRIORITY.MEDIUM,
      index: true,
    },

    // Related Resources (optional references)
    relatedModel: {
      type: String,
      enum: ["Placement", "Logbook", "Assessment", "Student", "User", null],
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // Action Link (optional)
    actionLink: {
      type: String,
      trim: true,
    },

    actionText: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    // Status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
    },

    // Email notification flag
    emailSent: {
      type: Boolean,
      default: false,
    },

    emailSentAt: {
      type: Date,
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// TTL index to auto-delete old notifications after 90 days
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Set expiration date before saving
 */
notificationSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    // Notifications expire after 90 days by default
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 90);
    this.expiresAt = expirationDate;
  }
  next();
});

/**
 * Populate createdBy before find operations
 */
notificationSchema.pre(/^find/, function (next) {
  this.populate({
    path: "createdBy",
    select: "firstName lastName role",
  });
  next();
});

/**
 * Static method to find unread notifications by user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Array>} Array of unread notifications
 */
notificationSchema.statics.findUnread = function (userId) {
  return this.find({ recipient: userId, isRead: false }).sort({
    createdAt: -1,
  });
};

/**
 * Static method to get notification count by user
 * @param {ObjectId} userId - User ID
 * @param {boolean} unreadOnly - Count only unread notifications
 * @returns {Promise<number>} Count of notifications
 */
notificationSchema.statics.getCount = function (userId, unreadOnly = true) {
  const query = { recipient: userId };
  if (unreadOnly) {
    query.isRead = false;
  }
  return this.countDocuments(query);
};

/**
 * Static method to find recent notifications
 * @param {ObjectId} userId - User ID
 * @param {number} limit - Number of notifications to return
 * @returns {Promise<Array>} Array of recent notifications
 */
notificationSchema.statics.findRecent = function (userId, limit = 10) {
  return this.find({ recipient: userId }).sort({ createdAt: -1 }).limit(limit);
};

/**
 * Static method to mark all as read for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} Update result
 */
notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: Date.now() }
  );
};

/**
 * Instance method to mark as read
 * @returns {Promise<Notification>} Updated notification
 */
notificationSchema.methods.markAsRead = async function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = Date.now();
    await this.save();
  }
  return this;
};

/**
 * Instance method to mark as unread
 * @returns {Promise<Notification>} Updated notification
 */
notificationSchema.methods.markAsUnread = async function () {
  this.isRead = false;
  this.readAt = null;
  await this.save();
  return this;
};

/**
 * Static method to create bulk notifications
 * Useful for sending same notification to multiple users
 * @param {Array<ObjectId>} recipients - Array of user IDs
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Array>} Array of created notifications
 */
notificationSchema.statics.createBulk = async function (
  recipients,
  notificationData
) {
  const notifications = recipients.map((recipientId) => ({
    ...notificationData,
    recipient: recipientId,
  }));

  return await this.insertMany(notifications);
};

/**
 * Static method to delete old read notifications (cleanup)
 * @param {number} daysOld - Delete notifications older than this many days
 * @returns {Promise<Object>} Delete result
 */
notificationSchema.statics.cleanup = function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    isRead: true,
    readAt: { $lt: cutoffDate },
  });
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
