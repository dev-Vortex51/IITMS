/**
 * Student Model
 * Represents student users with academic and placement information
 * Extends base User model with student-specific attributes
 */

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // Reference to base User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
      // index removed; schema-level index declared below
    },

    // Academic Information
    matricNumber: {
      type: String,
      required: [true, "Matric number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
      index: true,
    },

    level: {
      type: Number,
      enum: [100, 200, 300, 400, 500, 600],
      required: [true, "Level is required"],
      index: true,
    },

    session: {
      type: String,
      required: [true, "Academic session is required"],
      match: /^\d{4}\/\d{4}$/,
      index: true,
    },

    cgpa: {
      type: Number,
      min: 0,
      max: 5.0,
    },

    // Placement Information
    hasPlacement: {
      type: Boolean,
      default: false,
      index: true,
    },

    currentPlacement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Placement",
    },

    // Assigned Supervisors
    departmentalSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
    },

    industrialSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
    },

    // Training Dates (copied from approved placement)
    trainingStartDate: {
      type: Date,
    },

    trainingEndDate: {
      type: Date,
    },

    // Status Flags
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    placementApproved: {
      type: Boolean,
      default: false,
      index: true,
    },

    trainingCompleted: {
      type: Boolean,
      default: false,
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Coordinator who created the student
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
studentSchema.index({ department: 1, session: 1 });
studentSchema.index({ placementApproved: 1, isActive: 1 });
studentSchema.index({ user: 1 }); // For faster user lookups
studentSchema.index({ currentPlacement: 1 }); // For placement queries
studentSchema.index({ departmentalSupervisor: 1, isActive: 1 }); // For supervisor queries

// Virtual populate for logbooks
studentSchema.virtual("logbooks", {
  ref: "Logbook",
  localField: "_id",
  foreignField: "student",
});

// Virtual populate for assessments
studentSchema.virtual("assessments", {
  ref: "Assessment",
  localField: "_id",
  foreignField: "student",
});

// Virtual populate for placements (all placement applications)
studentSchema.virtual("placements", {
  ref: "Placement",
  localField: "_id",
  foreignField: "student",
});

/**
 * Update timestamp before saving
 */
studentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Static method to find students by department
 * @param {ObjectId} departmentId - Department ID
 * @returns {Promise<Array>} Array of students
 */
studentSchema.statics.findByDepartment = function (departmentId) {
  return this.find({ department: departmentId, isActive: true });
};

/**
 * Static method to find students with approved placements
 * @param {ObjectId} departmentId - Optional department filter
 * @returns {Promise<Array>} Array of students
 */
studentSchema.statics.findWithApprovedPlacements = function (
  departmentId = null
) {
  const query = { placementApproved: true, isActive: true };
  if (departmentId) {
    query.department = departmentId;
  }
  return this.find(query);
};

/**
 * Instance method to assign supervisor
 * @param {string} type - 'departmental' (academic) or 'industrial'
 * @param {ObjectId} supervisorId - Supervisor ID
 * @returns {Promise<Student>} Updated student
 */
studentSchema.methods.assignSupervisor = async function (type, supervisorId) {
  if (type === "departmental" || type === "academic") {
    this.departmentalSupervisor = supervisorId;
  } else if (type === "industrial") {
    this.industrialSupervisor = supervisorId;
  }
  await this.save();
  return this;
};

/**
 * Instance method to check if student can submit logbook
 * @returns {boolean} Can submit logbook
 */
studentSchema.methods.canSubmitLogbook = function () {
  return (
    this.placementApproved && this.trainingStartDate && !this.trainingCompleted
  );
};

/**
 * Instance method to calculate training progress percentage
 * @returns {number} Progress percentage
 */
studentSchema.methods.getTrainingProgress = function () {
  if (!this.trainingStartDate || !this.trainingEndDate) {
    return 0;
  }

  const now = new Date();
  const start = new Date(this.trainingStartDate);
  const end = new Date(this.trainingEndDate);

  if (now < start) return 0;
  if (now > end) return 100;

  const totalDuration = end - start;
  const elapsed = now - start;

  return Math.round((elapsed / totalDuration) * 100);
};

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
