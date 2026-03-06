const { createLogbookEntry } = require("./createLogbookEntry");
const { getLogbooks } = require("./getLogbooks");
const { getLogbookById } = require("./getLogbookById");
const { updateLogbookEntry } = require("./updateLogbookEntry");
const { submitLogbookEntry } = require("./submitLogbookEntry");
const { reviewLogbook } = require("./reviewLogbook");
const { getLogbooksPendingReview } = require("./getLogbooksPendingReview");
const { getStudentLogbookSummary } = require("./getStudentLogbookSummary");

const industrialReviewLogbook = async (logbookId, supervisorId, reviewData) =>
  reviewLogbook(logbookId, reviewData, supervisorId, "industrial");

module.exports = {
  createLogbookEntry,
  getLogbooks,
  getLogbookById,
  updateLogbookEntry,
  submitLogbookEntry,
  reviewLogbook,
  industrialReviewLogbook,
  getLogbooksPendingReview,
  getStudentLogbookSummary,
};
