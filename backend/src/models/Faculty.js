/**
 * Faculty Model
 * Represents academic faculties within the institution
 * Contains departments and manages faculty-level operations
 */

const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      unique: true,
      trim: true,
      index: true,
    },

    code: {
      type: String,
      required: [true, "Faculty code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Reference to the admin who created this faculty
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

// Virtual populate for departments
facultySchema.virtual("departments", {
  ref: "Department",
  localField: "_id",
  foreignField: "faculty",
  options: { match: { isActive: true } },
});

// Virtual for department count
facultySchema.virtual("departmentCount", {
  ref: "Department",
  localField: "_id",
  foreignField: "faculty",
  count: true,
});

/**
 * Update timestamp before saving
 */
facultySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Static method to find active faculties
 * @returns {Promise<Array>} Array of active faculties
 */
facultySchema.statics.findActive = function () {
  return this.find({ isActive: true }).populate("departments");
};

/**
 * Instance method to get all departments
 * @returns {Promise<Array>} Array of departments
 */
facultySchema.methods.getDepartments = async function () {
  const Department = mongoose.model("Department");
  return await Department.find({ faculty: this._id, isActive: true });
};

const Faculty = mongoose.model("Faculty", facultySchema);

module.exports = Faculty;
