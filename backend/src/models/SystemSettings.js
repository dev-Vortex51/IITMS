const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    // Academic Settings
    currentSession: {
      type: String,
      required: true,
      default: "2024/2025",
    },
    semester: {
      type: String,
      required: true,
      default: "First Semester",
    },

    // SIWES Settings
    siweDuration: {
      type: Number,
      required: true,
      default: 6,
      min: 1,
    },
    minWeeks: {
      type: Number,
      required: true,
      default: 24,
      min: 1,
    },

    // Approval Settings
    autoAssignSupervisors: {
      type: Boolean,
      default: false,
    },
    requireLogbookApproval: {
      type: Boolean,
      default: true,
    },

    // Singleton pattern - only one settings document should exist
    isSingleton: {
      type: Boolean,
      default: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
systemSettingsSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      throw new Error("System settings already exists. Use update instead.");
    }
  }
  next();
});

const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);

module.exports = SystemSettings;
