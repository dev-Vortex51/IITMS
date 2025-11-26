const mongoose = require("mongoose");

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    emailNotifications: {
      type: Boolean,
      default: false,
    },
    placementAlerts: {
      type: Boolean,
      default: false,
    },
    systemUpdates: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationPreference = mongoose.model(
  "NotificationPreference",
  notificationPreferenceSchema
);

module.exports = NotificationPreference;
