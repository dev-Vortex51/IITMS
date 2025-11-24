/**
 * User Model
 * Base model for all user types in the system
 * Handles authentication, authorization, and common user attributes
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { USER_ROLES } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // Don't include password in queries by default
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    // Role-Based Access Control
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: [true, "User role is required"],
      index: true,
    },

    // Department Assignment (for Coordinators and Departmental Supervisors)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: function () {
        return (
          this.role === USER_ROLES.COORDINATOR ||
          this.role === USER_ROLES.DEPT_SUPERVISOR
        );
      },
      index: true,
    },

    // Faculty Assignment (optional, derived from department)
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      index: true,
    },

    // Contact Information
    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFirstLogin: {
      type: Boolean,
      default: true,
    },

    passwordResetRequired: {
      type: Boolean,
      default: true,
    },

    // Password Reset Tokens
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Last Login Tracking
    lastLogin: {
      type: Date,
    },

    // Profile Information
    bio: {
      type: String,
      maxlength: 500,
    },

    profilePhoto: {
      type: String,
    },

    // Timestamps
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

// Indexes for performance optimization
userSchema.index({ email: 1, role: 1 });
userSchema.index({ isActive: 1, role: 1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Hash password before saving
 * Only hash if password is modified
 */
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Update the updatedAt timestamp before saving
 */
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Auto-populate faculty field based on department
 * For coordinators and departmental supervisors
 */
userSchema.pre("save", async function (next) {
  // Only populate faculty if department is modified and user has department-based role
  if (
    this.isModified("department") &&
    this.department &&
    (this.role === USER_ROLES.COORDINATOR ||
      this.role === USER_ROLES.DEPT_SUPERVISOR)
  ) {
    try {
      const Department = mongoose.model("Department");
      const department = await Department.findById(this.department).populate(
        "faculty"
      );
      if (department && department.faculty) {
        this.faculty = department.faculty._id;
      }
    } catch (error) {
      console.warn("Error auto-populating faculty:", error.message);
    }
  }
  next();
});

/**
 * Compare provided password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has role
 */
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

/**
 * Check if user has any of the specified roles
 * @param {Array<string>} roles - Roles to check
 * @returns {boolean} True if user has any of the roles
 */
userSchema.methods.hasAnyRole = function (roles) {
  return roles.includes(this.role);
};

/**
 * Remove sensitive fields from JSON output
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.__v;
  return obj;
};

/**
 * Static method to find active users by role
 * @param {string} role - User role
 * @returns {Promise<Array>} Array of users
 */
userSchema.statics.findActiveByRole = function (role) {
  return this.find({ role, isActive: true });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
