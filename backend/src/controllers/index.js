/**
 * Controllers Export
 * Central export point for all controller modules
 */

const authController = require("./authController");
const userController = require("./userController");
const studentController = require("./studentController");
const facultyController = require("./facultyController");
const departmentController = require("./departmentController");
const placementController = require("./placementController");
const logbookController = require("./logbookController");
const assessmentController = require("./assessmentController");
const supervisorController = require("./supervisorController");
const reportController = require("./reportController");
const notificationController = require("./notificationController");

module.exports = {
  authController,
  userController,
  studentController,
  facultyController,
  departmentController,
  placementController,
  logbookController,
  assessmentController,
  supervisorController,
  reportController,
  notificationController,
};
