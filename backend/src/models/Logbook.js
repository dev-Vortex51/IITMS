/**
 * Logbook Model
 * Represents student weekly logbook entries
 * Tracks tasks, evidence, and supervisor feedback
 */

const mongoose = require("mongoose");
const { LOGBOOK_STATUS } = require("../utils/constants");

const logbookSchema = new mongoose.Schema(
  {
    // Student Information
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
      index: true,
    },

    // Week Information
    weekNumber: {
      type: Number,
      required: [true, "Week number is required"],
      min: 1,
      max: 52,
      index: true,
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "End date must be on or after start date",
      },
    },

    // Content
    tasksPerformed: {
      type: String,
      required: [true, "Tasks performed is required"],
      minlength: 10,
      maxlength: 2000,
      trim: true,
    },

    skillsAcquired: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    challenges: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    lessonsLearned: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    // Evidence/Attachments
    evidence: [
      {
        name: String,
        path: String,
        type: String, // file type
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Status Tracking
    status: {
      type: String,
      enum: Object.values(LOGBOOK_STATUS),
      default: LOGBOOK_STATUS.DRAFT,
      index: true,
    },

    submittedAt: {
      type: Date,
    },

    // Supervisor Reviews
    reviews: [
      {
        supervisor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supervisor",
          required: true,
        },
        supervisorType: {
          type: String,
          enum: ["departmental", "industrial"],
          required: true,
        },
        comment: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        rating: {
          type: Number,
          min: 0,
          max: 10,
        },
        status: {
          type: String,
          enum: Object.values(LOGBOOK_STATUS),
          required: true,
        },
        reviewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Overall Review Status
    departmentalReview: {
      status: {
        type: String,
        enum: Object.values(LOGBOOK_STATUS),
        default: LOGBOOK_STATUS.SUBMITTED,
      },
      reviewedAt: Date,
    },

    industrialReview: {
      status: {
        type: String,
        enum: Object.values(LOGBOOK_STATUS),
        default: LOGBOOK_STATUS.SUBMITTED,
      },
      reviewedAt: Date,
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
  }
);

// Composite unique index - one logbook per student per week
logbookSchema.index({ student: 1, weekNumber: 1 }, { unique: true });
logbookSchema.index({ status: 1, submittedAt: -1 });

// Additional indexes for supervisor queries
logbookSchema.index({ student: 1, status: 1, submittedAt: -1 });
logbookSchema.index({
  "departmentalReview.status": 1,
  "departmentalReview.reviewer": 1,
});
logbookSchema.index({
  "industrialReview.status": 1,
  "industrialReview.reviewer": 1,
});

// Virtual for average rating
logbookSchema.virtual("averageRating").get(function () {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce(
    (acc, review) => acc + (review.rating || 0),
    0
  );
  return (sum / this.reviews.length).toFixed(2);
});

// Virtual to check if both supervisors have reviewed
logbookSchema.virtual("fullyReviewed").get(function () {
  return (
    this.departmentalReview.status !== LOGBOOK_STATUS.SUBMITTED &&
    this.industrialReview.status !== LOGBOOK_STATUS.SUBMITTED
  );
});

/**
 * Update timestamp before saving
 */
logbookSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Auto-submit if status changed from draft
  if (
    this.isModified("status") &&
    this.status === LOGBOOK_STATUS.SUBMITTED &&
    !this.submittedAt
  ) {
    this.submittedAt = Date.now();
  }

  next();
});

/**
 * Static method to find logbooks by student
 * @param {ObjectId} studentId - Student ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} Array of logbooks
 */
logbookSchema.statics.findByStudent = function (studentId, status = null) {
  const query = { student: studentId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ weekNumber: 1 });
};

/**
 * Static method to find logbooks pending review by supervisor
 * @param {ObjectId} supervisorId - Supervisor ID
 * @param {string} supervisorType - 'departmental' or 'industrial'
 * @returns {Promise<Array>} Array of logbooks
 */
logbookSchema.statics.findPendingReview = function (
  supervisorId,
  supervisorType
) {
  const Supervisor = mongoose.model("Supervisor");

  // First get the supervisor's assigned students
  return Supervisor.findById(supervisorId).then((supervisor) => {
    if (!supervisor) return [];

    const query = {
      student: { $in: supervisor.assignedStudents },
      status: LOGBOOK_STATUS.SUBMITTED,
    };

    // Filter by review status
    if (supervisorType === "departmental") {
      query["departmentalReview.status"] = LOGBOOK_STATUS.SUBMITTED;
    } else {
      query["industrialReview.status"] = LOGBOOK_STATUS.SUBMITTED;
    }

    return this.find(query)
      .populate({
        path: "student",
        select: "matricNumber user",
        populate: {
          path: "user",
          select: "firstName lastName email",
        },
      })
      .sort({ submittedAt: -1 });
  });
};

/**
 * Instance method to submit logbook
 * @returns {Promise<Logbook>} Updated logbook
 */
logbookSchema.methods.submit = async function () {
  this.status = LOGBOOK_STATUS.SUBMITTED;
  this.submittedAt = Date.now();
  await this.save();
  return this;
};

/**
 * Instance method to add supervisor review
 * @param {ObjectId} supervisorId - Supervisor ID
 * @param {string} supervisorType - 'departmental' or 'industrial'
 * @param {Object} reviewData - Review data {comment, rating, status}
 * @returns {Promise<Logbook>} Updated logbook
 */
logbookSchema.methods.addReview = async function (
  supervisorId,
  supervisorType,
  reviewData
) {
  // Add review to array
  this.reviews.push({
    supervisor: supervisorId,
    supervisorType,
    comment: reviewData.comment,
    rating: reviewData.rating,
    status: reviewData.status,
    reviewedAt: Date.now(),
  });

  // Update overall review status
  if (supervisorType === "departmental") {
    this.departmentalReview.status = reviewData.status;
    this.departmentalReview.reviewedAt = Date.now();
  } else {
    this.industrialReview.status = reviewData.status;
    this.industrialReview.reviewedAt = Date.now();
  }

  // Update overall status if both reviewed
  if (
    this.departmentalReview.status !== LOGBOOK_STATUS.SUBMITTED &&
    this.industrialReview.status !== LOGBOOK_STATUS.SUBMITTED
  ) {
    // If any rejected, mark as rejected
    if (
      this.departmentalReview.status === LOGBOOK_STATUS.REJECTED ||
      this.industrialReview.status === LOGBOOK_STATUS.REJECTED
    ) {
      this.status = LOGBOOK_STATUS.REJECTED;
    } else {
      this.status = LOGBOOK_STATUS.APPROVED;
    }
  } else {
    this.status = LOGBOOK_STATUS.REVIEWED;
  }

  await this.save();
  return this;
};

const Logbook = mongoose.model("Logbook", logbookSchema);

module.exports = Logbook;
