/**
 * SupervisorAssignment Model
 * Tracks the relationship between a student and an industrial supervisor with status
 */

const mongoose = require("mongoose");

const supervisorAssignmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
      required: true,
      index: true,
    },
    placement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Placement",
      required: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "revoked"],
      default: "active",
      index: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Ensure uniqueness per student-supervisor per placement
supervisorAssignmentSchema.index(
  { student: 1, supervisor: 1, placement: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "SupervisorAssignment",
  supervisorAssignmentSchema
);
