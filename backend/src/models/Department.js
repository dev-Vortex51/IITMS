/**
 * Department Model
 * Represents academic departments within faculties
 * Manages coordinators, students, and department-level operations
 */

const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      index: true,
    },

    code: {
      type: String,
      required: [true, "Department code is required"],
      uppercase: true,
      trim: true,
      index: true,
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Faculty reference is required"],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Department SIWES Coordinators
    coordinators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Created by admin or faculty
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

// Composite unique index for department code within faculty
departmentSchema.index({ code: 1, faculty: 1 }, { unique: true });

// Virtual populate for students
departmentSchema.virtual("students", {
  ref: "Student",
  localField: "_id",
  foreignField: "department",
  options: { match: { isActive: true } },
});

// Virtual for student count
departmentSchema.virtual("studentCount", {
  ref: "Student",
  localField: "_id",
  foreignField: "department",
  count: true,
});

/**
 * Update timestamp before saving
 */
departmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Populate faculty before find operations
 */
departmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "faculty",
    select: "name code",
  });
  next();
});

/**
 * Static method to find active departments
 * @param {ObjectId} facultyId - Optional faculty filter
 * @returns {Promise<Array>} Array of active departments
 */
departmentSchema.statics.findActive = function (facultyId = null) {
  const query = { isActive: true };
  if (facultyId) {
    query.faculty = facultyId;
  }
  return this.find(query).populate("coordinators", "firstName lastName email");
};

/**
 * Instance method to add coordinator
 * @param {ObjectId} userId - User ID of coordinator
 * @returns {Promise<Department>} Updated department
 */
departmentSchema.methods.addCoordinator = async function (userId) {
  if (!this.coordinators.includes(userId)) {
    this.coordinators.push(userId);
    await this.save();
  }
  return this;
};

/**
 * Instance method to remove coordinator
 * @param {ObjectId} userId - User ID of coordinator
 * @returns {Promise<Department>} Updated department
 */
departmentSchema.methods.removeCoordinator = async function (userId) {
  this.coordinators = this.coordinators.filter(
    (id) => id.toString() !== userId.toString()
  );
  await this.save();
  return this;
};

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
