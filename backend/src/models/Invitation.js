const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: [
        "coordinator",
        "academic_supervisor",
        "student",
        "industrial_supervisor",
      ],
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // index removed; TTL index declared via schema.index below
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedByRole: {
      type: String,
      required: true,
      enum: ["admin", "coordinator"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
      index: true,
    },
    // Additional data that may be needed for account creation
    metadata: {
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
      },
      // For students
      matricNumber: String,
      level: Number,
      session: String,
    },
    acceptedAt: Date,
    cancelledAt: Date,
    // Track resend attempts
    resendCount: {
      type: Number,
      default: 0,
    },
    lastResentAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for cleanup of expired invitations
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for finding pending invitations by email
invitationSchema.index({ email: 1, status: 1 });

// Static method to generate secure token
invitationSchema.statics.generateToken = function () {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
};

// Instance method to check if invitation is valid
invitationSchema.methods.isValid = function () {
  return this.status === "pending" && this.expiresAt > new Date();
};

// Instance method to check if can be resent
invitationSchema.methods.canResend = function () {
  if (this.status !== "pending") return false;
  if (!this.lastResentAt) return true;

  // Can resend after 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastResentAt < fiveMinutesAgo;
};

// Static method to cleanup expired invitations
invitationSchema.statics.cleanupExpired = async function () {
  const now = new Date();
  const result = await this.updateMany(
    { status: "pending", expiresAt: { $lt: now } },
    { $set: { status: "expired" } }
  );
  return result;
};

const Invitation = mongoose.model("Invitation", invitationSchema);

module.exports = Invitation;
