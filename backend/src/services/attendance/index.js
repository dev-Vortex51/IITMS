const { checkIn } = require("./checkIn");
const { checkOut } = require("./checkOut");
const { getTodayCheckIn } = require("./getTodayCheckIn");
const { getAttendanceHistory } = require("./getAttendanceHistory");
const { getAttendanceStats } = require("./getAttendanceStats");
const { getPlacementAttendance } = require("./getPlacementAttendance");
const { submitAbsenceRequest } = require("./submitAbsenceRequest");
const { approveAttendance } = require("./approveAttendance");
const { rejectAttendance } = require("./rejectAttendance");
const { reclassifyAttendance } = require("./reclassifyAttendance");
const { markAbsent } = require("./markAbsent");
const { getAttendanceSummary } = require("./getAttendanceSummary");

module.exports = {
  checkIn,
  checkOut,
  getTodayCheckIn,
  getAttendanceHistory,
  getAttendanceStats,
  getPlacementAttendance,
  submitAbsenceRequest,
  approveAttendance,
  rejectAttendance,
  reclassifyAttendance,
  markAbsent,
  getAttendanceSummary,
};
