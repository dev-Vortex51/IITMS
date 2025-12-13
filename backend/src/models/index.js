/**
 * Models Index
 * Central export point for all database models
 * Simplifies imports throughout the application
 */

const User = require("./User");
const Faculty = require("./Faculty");
const Department = require("./Department");
const Student = require("./Student");
const Supervisor = require("./Supervisor");
const Placement = require("./Placement");
const Logbook = require("./Logbook");
const Assessment = require("./Assessment");
const Notification = require("./Notification");
const Invitation = require("./Invitation");
const Attendance = require("./Attendance");

module.exports = {
  User,
  Faculty,
  Department,
  Student,
  Supervisor,
  Placement,
  Logbook,
  Assessment,
  Notification,
  Invitation,
  Attendance,
};
