/**
 * Supervisor Model
 * Represents both Departmental and Industrial Supervisors
 * Manages supervisor assignments and student supervision
 */

const mongoose = require("mongoose");

const supervisorSchema = new mongoose.Schema(
  {
    // Reference to base User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
      index: true,
    },

    // Supervisor Type
    type: {
      type: String,
      enum: ["departmental", "industrial"],
      required: [true, "Supervisor type is required"],
      index: true,
    },

    // Department (for departmental supervisors)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: function () {
        return this.type === "departmental";
      },
      index: true,
    },

    // Company Information (for industrial supervisors)
    companyName: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "industrial";
      },
    },

    companyAddress: {
      type: String,
      trim: true,
    },

    position: {
      type: String,
      trim: true,
    },

    // Professional Information
    qualification: {
      type: String,
      trim: true,
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
    },

    specialization: {
      type: String,
      trim: true,
    },

    // Assigned Students
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    // Maximum number of students that can be assigned
    maxStudents: {
      type: Number,
      default: 10,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// Indexes
supervisorSchema.index({ type: 1, isActive: 1 });
supervisorSchema.index({ department: 1, isActive: 1 });

// Virtual for current student count
supervisorSchema.virtual("currentStudentCount").get(function () {
  return this.assignedStudents ? this.assignedStudents.length : 0;
});

// Virtual to check if supervisor can take more students
supervisorSchema.virtual("canTakeMoreStudents").get(function () {
  const studentCount = this.assignedStudents ? this.assignedStudents.length : 0;
  return studentCount < this.maxStudents && this.isAvailable;
});

/**
 * Update timestamp before saving
 */
supervisorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  // Update availability based on student count
  this.isAvailable = this.assignedStudents.length < this.maxStudents;
  next();
});

/**
 * Populate user before find operations
 */
supervisorSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName email phone",
  });
  next();
});

/**
 * Static method to find available supervisors
 * @param {string} type - Supervisor type ('departmental' or 'industrial')
 * @param {ObjectId} departmentId - Department ID (for departmental supervisors)
 * @returns {Promise<Array>} Array of available supervisors
 */
supervisorSchema.statics.findAvailable = function (type, departmentId = null) {
  const query = { type, isActive: true, isAvailable: true };
  if (type === "departmental" && departmentId) {
    query.department = departmentId;
  }
  return this.find(query);
};

/**
 * Instance method to assign student
 * @param {ObjectId} studentId - Student ID
 * @returns {Promise<Supervisor>} Updated supervisor
 */
supervisorSchema.methods.assignStudent = async function (studentId) {
  if (this.assignedStudents.length >= this.maxStudents) {
    throw new Error("Supervisor has reached maximum student capacity");
  }

  if (!this.assignedStudents.includes(studentId)) {
    this.assignedStudents.push(studentId);
    await this.save();
  }

  return this;
};

/**
 * Instance method to remove student
 * @param {ObjectId} studentId - Student ID
 * @returns {Promise<Supervisor>} Updated supervisor
 */
supervisorSchema.methods.removeStudent = async function (studentId) {
  this.assignedStudents = this.assignedStudents.filter(
    (id) => id.toString() !== studentId.toString()
  );
  await this.save();
  return this;
};

/**
 * Instance method to get assigned students with details
 * @returns {Promise<Array>} Array of students
 */
supervisorSchema.methods.getAssignedStudents = async function () {
  const Student = mongoose.model("Student");
  return await Student.find({ _id: { $in: this.assignedStudents } })
    .populate("user", "firstName lastName email")
    .populate("department", "name code");
};

const Supervisor = mongoose.model("Supervisor", supervisorSchema);

module.exports = Supervisor;
