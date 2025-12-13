/**
 * Attendance Model
 * Tracks daily student check-ins for industrial training
 */

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
      index: true,
    },

    placement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Placement",
      required: [true, "Placement reference is required"],
      index: true,
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },

    // Check-in timestamp
    checkInTime: {
      type: Date,
      required: false,
    },

    // Check-out timestamp
    checkOutTime: {
      type: Date,
    },

    // Hours worked (calculated)
    hoursWorked: {
      type: Number,
      min: 0,
      max: 24,
    },

    // Punctuality status (auto-detected, immutable after set)
    punctuality: {
      type: String,
      enum: ["ON_TIME", "LATE"],
      required: false,
      index: true,
    },

    // Final day status (resolved after validation)
    dayStatus: {
      type: String,
      enum: [
        "PRESENT_ON_TIME",
        "PRESENT_LATE",
        "HALF_DAY",
        "ABSENT",
        "EXCUSED_ABSENCE",
        "INCOMPLETE",
      ],
      required: true,
      default: "INCOMPLETE",
      index: true,
    },

    // Approval status for supervisor validation
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"],
      default: "PENDING",
      index: true,
    },

    // Absence reason (for absence requests)
    absenceReason: {
      type: String,
      maxlength: 500,
      trim: true,
    },

    // Location data (optional)
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    // Notes from student
    notes: {
      type: String,
      maxlength: 500,
      trim: true,
    },

    // Legacy status field (kept for backward compatibility)
    status: {
      type: String,
      enum: ["present", "late", "absent"],
      default: "present",
      index: true,
    },

    // Supervisor who reviewed/approved
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
    },

    reviewedAt: {
      type: Date,
    },

    // Supervisor who acknowledged the record (backward compatibility)
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
    },

    // Supervisor comment/feedback
    supervisorComment: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    // Flags for anomaly detection
    isLateEntry: {
      type: Boolean,
      default: false,
    },

    isIncomplete: {
      type: Boolean,
      default: false,
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

// Compound unique index - one check-in per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Index for querying by placement and date range
attendanceSchema.index({ placement: 1, date: -1 });

// SIWES Standard Work Schedule Constants (immutable system constants)
attendanceSchema.statics.WORK_START_HOUR = 8; // 8:00 AM
attendanceSchema.statics.WORK_START_MINUTE = 0;
attendanceSchema.statics.WORK_END_HOUR = 16; // 4:00 PM
attendanceSchema.statics.WORK_END_MINUTE = 0;
attendanceSchema.statics.GRACE_PERIOD_MINUTES = 15;
attendanceSchema.statics.MIN_REQUIRED_HOURS = 6;

/**
 * Calculate punctuality based on check-in time
 * @param {Date} checkInTime - Check-in timestamp
 * @returns {String} "ON_TIME" or "LATE"
 */
attendanceSchema.statics.calculatePunctuality = function (checkInTime) {
  const checkIn = new Date(checkInTime);
  const cutoffTime = new Date(checkIn);
  cutoffTime.setHours(
    this.WORK_START_HOUR,
    this.WORK_START_MINUTE + this.GRACE_PERIOD_MINUTES,
    0,
    0
  );

  return checkIn <= cutoffTime ? "ON_TIME" : "LATE";
};

/**
 * Calculate hours worked between check-in and check-out
 * @param {Date} checkInTime
 * @param {Date} checkOutTime
 * @returns {Number} Hours worked (rounded to 2 decimals)
 */
attendanceSchema.statics.calculateHoursWorked = function (
  checkInTime,
  checkOutTime
) {
  if (!checkInTime || !checkOutTime) return 0;
  const diff = new Date(checkOutTime) - new Date(checkInTime);
  return Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
};

/**
 * Determine day status based on attendance data
 * @param {Object} attendance - Attendance record
 * @returns {String} Day status
 */
attendanceSchema.statics.determineDayStatus = function (attendance) {
  if (attendance.absenceReason && attendance.approvalStatus === "APPROVED") {
    return "EXCUSED_ABSENCE";
  }

  if (!attendance.checkInTime) {
    return "ABSENT";
  }

  if (!attendance.checkOutTime) {
    return "INCOMPLETE";
  }

  const hoursWorked = this.calculateHoursWorked(
    attendance.checkInTime,
    attendance.checkOutTime
  );

  if (hoursWorked < this.MIN_REQUIRED_HOURS) {
    return "HALF_DAY";
  }

  return attendance.punctuality === "ON_TIME"
    ? "PRESENT_ON_TIME"
    : "PRESENT_LATE";
};

/**
 * Update timestamp before saving
 */
attendanceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Auto-calculate punctuality if checkInTime exists and punctuality not set
  if (this.checkInTime && !this.punctuality) {
    this.punctuality = this.constructor.calculatePunctuality(this.checkInTime);
  }

  // Auto-calculate hours worked if both times exist
  if (this.checkInTime && this.checkOutTime) {
    this.hoursWorked = this.constructor.calculateHoursWorked(
      this.checkInTime,
      this.checkOutTime
    );
  }

  // Set flags
  this.isLateEntry = this.punctuality === "LATE";
  this.isIncomplete = !this.checkOutTime && !!this.checkInTime;

  next();
});

/**
 * Static method to check if student has checked in today
 * @param {ObjectId} studentId - Student ID
 * @returns {Promise<Boolean>} True if checked in today
 */
attendanceSchema.statics.hasCheckedInToday = async function (studentId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendance = await this.findOne({
    student: studentId,
    date: { $gte: today, $lt: tomorrow },
  });

  return !!attendance;
};

/**
 * Static method to get attendance for a student in a date range
 * @param {ObjectId} studentId - Student ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Attendance records
 */
attendanceSchema.statics.getAttendanceRange = async function (
  studentId,
  startDate,
  endDate
) {
  return this.find({
    student: studentId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 });
};

/**
 * Static method to get attendance statistics for a student
 * @param {ObjectId} studentId - Student ID
 * @returns {Promise<Object>} Attendance statistics
 */
attendanceSchema.statics.getAttendanceStats = async function (studentId) {
  const total = await this.countDocuments({ student: studentId });
  const present = await this.countDocuments({
    student: studentId,
    status: "present",
  });
  const late = await this.countDocuments({
    student: studentId,
    status: "late",
  });
  const absent = await this.countDocuments({
    student: studentId,
    status: "absent",
  });

  const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;

  return {
    total,
    present,
    late,
    absent,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
  };
};

/**
 * Instance method to determine if check-in is late
 * Based on 9:00 AM cutoff
 */
attendanceSchema.methods.isLateCheckIn = function () {
  const checkInHour = this.checkInTime.getHours();
  return checkInHour >= 9;
};

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
