const mongoose = require("mongoose");
const { PLACEMENT_STATUS } = require("../utils/constants");

const placementSchema = new mongoose.Schema(
  {
    // Student Information
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
      index: true,
    },

    // Company Information
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    companyAddress: {
      type: String,
      required: [true, "Company address is required"],
      trim: true,
    },

    companyEmail: {
      type: String,
      required: [true, "Company email is required"],
      lowercase: true,
      trim: true,
    },

    companyPhone: {
      type: String,
      required: [true, "Company phone is required"],
      trim: true,
    },

    companyWebsite: {
      type: String,
      trim: true,
    },

    companySector: {
      type: String,
      trim: true,
    },

    // Position Information
    position: {
      type: String,
      required: [true, "Position/role is required"],
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    // Industrial Supervisor Information (from student submission)
    supervisorName: {
      type: String,
      trim: true,
    },

    supervisorEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    supervisorPhone: {
      type: String,
      trim: true,
    },

    supervisorPosition: {
      type: String,
      trim: true,
    },

    // Training Period
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },

    // Documents
    acceptanceLetter: {
      type: String, // File path/URL
      required: false, // Made optional
    },

    additionalDocuments: [
      {
        name: String,
        path: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Approval Workflow
    status: {
      type: String,
      enum: Object.values(PLACEMENT_STATUS),
      default: PLACEMENT_STATUS.PENDING,
      index: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    reviewComment: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Supervisor Assignment (after approval)
    industrialSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
    },

    supervisorAssignedAt: {
      type: Date,
    },

    // Additional Information
    expectedLearningOutcomes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    specialRequirements: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Metadata
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
  },
);

// Indexes for performance
placementSchema.index({ student: 1, status: 1 });
placementSchema.index({ status: 1, submittedAt: -1 });
placementSchema.index({ companyName: 1 });

// Virtual for training duration in weeks
placementSchema.virtual("durationInWeeks").get(function () {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
});

// Virtual for training duration in days
placementSchema.virtual("durationInDays").get(function () {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Update timestamp before saving
 */
placementSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Populate student and reviewedBy before find operations
 */
placementSchema.pre(/^find/, function (next) {
  this.populate({
    path: "student",
    select: "matricNumber user",
    populate: {
      path: "user",
      select: "firstName lastName email",
    },
  })
    .populate({
      path: "reviewedBy",
      select: "firstName lastName email",
    })
    .populate({
      path: "industrialSupervisor",
      select: "user companyName position",
    });
  next();
});

placementSchema.statics.findPending = function (departmentId = null) {
  const query = { status: PLACEMENT_STATUS.PENDING };

  if (departmentId) {
    return this.find(query).populate({
      path: "student",
      match: { department: departmentId },
    });
  }

  return this.find(query);
};

placementSchema.statics.findApprovedWithoutSupervisor = function () {
  return this.find({
    status: PLACEMENT_STATUS.APPROVED,
    industrialSupervisor: null,
  });
};

placementSchema.methods.approve = async function (reviewerId, comment = "") {
  this.status = PLACEMENT_STATUS.APPROVED;
  this.reviewedBy = reviewerId;
  this.reviewedAt = Date.now();
  this.reviewComment = comment;
  await this.save();
  return this;
};

placementSchema.methods.reject = async function (reviewerId, comment) {
  this.status = PLACEMENT_STATUS.REJECTED;
  this.reviewedBy = reviewerId;
  this.reviewedAt = Date.now();
  this.reviewComment = comment;
  await this.save();
  return this;
};

placementSchema.methods.assignIndustrialSupervisor = async function (
  supervisorId,
) {
  if (this.status !== PLACEMENT_STATUS.APPROVED) {
    throw new Error("Can only assign supervisor to approved placements");
  }

  this.industrialSupervisor = supervisorId;
  this.supervisorAssignedAt = Date.now();
  await this.save();
  return this;
};

const Placement = mongoose.model("Placement", placementSchema);

module.exports = Placement;
