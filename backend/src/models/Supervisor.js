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
      enum: ["academic", "industrial", "departmental"], // Keep "departmental" for backward compatibility
      required: [true, "Supervisor type is required"],
      index: true,
    },

    // Department (optional - academic supervisors can supervise cross-department)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: false,
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
      default: function () {
        // Academic supervisors: 10 students (cross-department), Industrial: 10 students
        return this.type === "academic" ? 10 : 10;
      },
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

// Virtual for supervisor name (from user)
supervisorSchema.virtual("name").get(function () {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : "";
});

// Virtual for email (from user)
supervisorSchema.virtual("email").get(function () {
  return this.user ? this.user.email : "";
});

// Virtual for phone (from user)
supervisorSchema.virtual("phone").get(function () {
  return this.user ? this.user.phone : "";
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
 * Static method to find available supervisors
 * @param {string} type - Supervisor type ('departmental' or 'industrial')
 * @param {ObjectId} departmentId - Department ID (for departmental supervisors)
 * @returns {Promise<Array>} Array of available supervisors
 */
supervisorSchema.statics.findAvailable = function (type, departmentId = null) {
  const query = { isActive: true, isAvailable: true };

  // Handle academic and departmental supervisors (treat them the same)
  if (type === "academic" || type === "departmental") {
    query.type = { $in: ["academic", "departmental"] };
    // Filter by department if provided, or include cross-department supervisors
    if (departmentId) {
      query.$or = [
        { department: departmentId },
        { department: { $in: [null, undefined] } },
      ];
    }
  } else {
    // For industrial supervisors, just match the type
    query.type = type;
  }

  return this.find(query).populate("user", "firstName lastName email phone");
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
