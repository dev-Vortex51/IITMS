/**
 * Assessment Model
 * Represents student performance assessments by supervisors
 * Tracks scores across multiple criteria and provides feedback
 */

const mongoose = require("mongoose");
const { ASSESSMENT_STATUS, ASSESSMENT_TYPES } = require("../utils/constants");

const assessmentSchema = new mongoose.Schema(
  {
    // Student Information
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
      index: true,
    },

    // Supervisor Information
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
      required: [true, "Supervisor reference is required"],
      index: true,
    },

    // Assessment Type
    type: {
      type: String,
      enum: Object.values(ASSESSMENT_TYPES),
      required: [true, "Assessment type is required"],
      index: true,
    },

    // Placement Reference
    placement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Placement",
    },

    // Assessment Scores (out of 100)
    scores: {
      technical: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      communication: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      punctuality: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      initiative: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      teamwork: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      professionalism: {
        type: Number,
        min: 0,
        max: 100,
      },
      problemSolving: {
        type: Number,
        min: 0,
        max: 100,
      },
      adaptability: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    // Detailed Feedback
    strengths: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    areasForImprovement: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    comment: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    recommendation: {
      type: String,
      enum: ["excellent", "very_good", "good", "fair", "poor"],
      required: true,
    },

    // Overall Grade
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "E", "F"],
    },

    // Status
    status: {
      type: String,
      enum: Object.values(ASSESSMENT_STATUS),
      default: ASSESSMENT_STATUS.PENDING,
      index: true,
    },

    submittedAt: {
      type: Date,
    },

    // Verification by Coordinator
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verifiedAt: {
      type: Date,
    },

    verificationComment: {
      type: String,
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
  }
);

// Composite index - one assessment per type per supervisor per student
assessmentSchema.index(
  { student: 1, supervisor: 1, type: 1 },
  { unique: true }
);
assessmentSchema.index({ status: 1, submittedAt: -1 });

// Virtual for total score
assessmentSchema.virtual("totalScore").get(function () {
  const scoreFields = [
    "technical",
    "communication",
    "punctuality",
    "initiative",
    "teamwork",
  ];
  let sum = 0;
  let count = 0;

  scoreFields.forEach((field) => {
    if (this.scores[field] !== undefined && this.scores[field] !== null) {
      sum += this.scores[field];
      count++;
    }
  });

  // Include optional fields if present
  ["professionalism", "problemSolving", "adaptability"].forEach((field) => {
    if (this.scores[field] !== undefined && this.scores[field] !== null) {
      sum += this.scores[field];
      count++;
    }
  });

  return count > 0 ? sum : 0;
});

// Virtual for average score
assessmentSchema.virtual("averageScore").get(function () {
  const scoreFields = [
    "technical",
    "communication",
    "punctuality",
    "initiative",
    "teamwork",
  ];
  let sum = 0;
  let count = 0;

  scoreFields.forEach((field) => {
    if (this.scores[field] !== undefined && this.scores[field] !== null) {
      sum += this.scores[field];
      count++;
    }
  });

  // Include optional fields if present
  ["professionalism", "problemSolving", "adaptability"].forEach((field) => {
    if (this.scores[field] !== undefined && this.scores[field] !== null) {
      sum += this.scores[field];
      count++;
    }
  });

  return count > 0 ? (sum / count).toFixed(2) : 0;
});

// Virtual for percentage
assessmentSchema.virtual("percentage").get(function () {
  return parseFloat(this.averageScore);
});

/**
 * Calculate and assign grade before saving
 */
assessmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Auto-calculate grade based on average score
  const avg = parseFloat(this.averageScore);

  if (avg >= 70) this.grade = "A";
  else if (avg >= 60) this.grade = "B";
  else if (avg >= 50) this.grade = "C";
  else if (avg >= 45) this.grade = "D";
  else if (avg >= 40) this.grade = "E";
  else this.grade = "F";

  // Set submitted date if status changed to submitted
  if (
    this.isModified("status") &&
    this.status === ASSESSMENT_STATUS.SUBMITTED &&
    !this.submittedAt
  ) {
    this.submittedAt = Date.now();
  }

  next();
});

/**
 * Populate references before find operations
 */
assessmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "student",
    select: "matricNumber user",
    populate: {
      path: "user",
      select: "firstName lastName email",
    },
  })
    .populate({
      path: "supervisor",
      select: "user type companyName",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    })
    .populate({
      path: "verifiedBy",
      select: "firstName lastName email",
    });
  next();
});

/**
 * Static method to find assessments by student
 * @param {ObjectId} studentId - Student ID
 * @returns {Promise<Array>} Array of assessments
 */
assessmentSchema.statics.findByStudent = function (studentId) {
  return this.find({ student: studentId }).sort({ createdAt: -1 });
};

/**
 * Static method to find assessments by supervisor
 * @param {ObjectId} supervisorId - Supervisor ID
 * @returns {Promise<Array>} Array of assessments
 */
assessmentSchema.statics.findBySupervisor = function (supervisorId) {
  return this.find({ supervisor: supervisorId }).sort({ createdAt: -1 });
};

/**
 * Static method to find pending assessments
 * @param {ObjectId} supervisorId - Optional supervisor filter
 * @returns {Promise<Array>} Array of assessments
 */
assessmentSchema.statics.findPending = function (supervisorId = null) {
  const query = { status: ASSESSMENT_STATUS.PENDING };
  if (supervisorId) {
    query.supervisor = supervisorId;
  }
  return this.find(query).sort({ createdAt: 1 });
};

/**
 * Instance method to submit assessment
 * @returns {Promise<Assessment>} Updated assessment
 */
assessmentSchema.methods.submit = async function () {
  this.status = ASSESSMENT_STATUS.SUBMITTED;
  this.submittedAt = Date.now();
  await this.save();
  return this;
};

/**
 * Instance method to verify assessment (by coordinator)
 * @param {ObjectId} coordinatorId - Coordinator ID
 * @param {string} comment - Verification comment
 * @returns {Promise<Assessment>} Updated assessment
 */
assessmentSchema.methods.verify = async function (coordinatorId, comment = "") {
  this.status = ASSESSMENT_STATUS.COMPLETED;
  this.verifiedBy = coordinatorId;
  this.verifiedAt = Date.now();
  this.verificationComment = comment;
  await this.save();
  return this;
};

/**
 * Instance method to calculate final grade for student
 * Combines departmental and industrial assessments
 * @param {Assessment} otherAssessment - The other assessment (dept or industrial)
 * @returns {Object} Combined grade information
 */
assessmentSchema.methods.calculateFinalGrade = function (otherAssessment) {
  const thisScore = parseFloat(this.averageScore);
  const otherScore = parseFloat(otherAssessment.averageScore);

  // Weighted average: 40% departmental, 60% industrial (can be configured)
  let finalScore;
  if (this.type === ASSESSMENT_TYPES.DEPARTMENTAL) {
    finalScore = thisScore * 0.4 + otherScore * 0.6;
  } else {
    finalScore = thisScore * 0.6 + otherScore * 0.4;
  }

  let grade;
  if (finalScore >= 70) grade = "A";
  else if (finalScore >= 60) grade = "B";
  else if (finalScore >= 50) grade = "C";
  else if (finalScore >= 45) grade = "D";
  else if (finalScore >= 40) grade = "E";
  else grade = "F";

  return {
    departmentalScore:
      this.type === ASSESSMENT_TYPES.DEPARTMENTAL ? thisScore : otherScore,
    industrialScore:
      this.type === ASSESSMENT_TYPES.INDUSTRIAL ? thisScore : otherScore,
    finalScore: finalScore.toFixed(2),
    grade,
  };
};

const Assessment = mongoose.model("Assessment", assessmentSchema);

module.exports = Assessment;
