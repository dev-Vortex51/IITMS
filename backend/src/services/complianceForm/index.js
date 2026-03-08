const { createComplianceForm } = require("./createComplianceForm");
const { updateComplianceForm } = require("./updateComplianceForm");
const { getComplianceForms } = require("./getComplianceForms");
const { getComplianceFormById } = require("./getComplianceFormById");
const { submitComplianceForm } = require("./submitComplianceForm");
const { reviewComplianceForm } = require("./reviewComplianceForm");
const { getComplianceRegistryTemplate } = require("./getComplianceRegistryTemplate");

module.exports = {
  createComplianceForm,
  updateComplianceForm,
  getComplianceForms,
  getComplianceFormById,
  submitComplianceForm,
  reviewComplianceForm,
  getComplianceRegistryTemplate,
};
