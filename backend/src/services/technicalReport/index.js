const { createTechnicalReport } = require("./createTechnicalReport");
const { updateTechnicalReport } = require("./updateTechnicalReport");
const { getTechnicalReports } = require("./getTechnicalReports");
const { getTechnicalReportById } = require("./getTechnicalReportById");
const { submitTechnicalReport } = require("./submitTechnicalReport");
const { reviewTechnicalReport } = require("./reviewTechnicalReport");

module.exports = {
  createTechnicalReport,
  updateTechnicalReport,
  getTechnicalReports,
  getTechnicalReportById,
  submitTechnicalReport,
  reviewTechnicalReport,
};
