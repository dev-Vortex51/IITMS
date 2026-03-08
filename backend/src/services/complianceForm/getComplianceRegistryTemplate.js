const getComplianceRegistryTemplate = async () => {
  return [
    { value: "introduction_letter", label: "Introduction Letter" },
    { value: "acceptance_letter", label: "Acceptance Letter" },
    { value: "itf_form_8", label: "ITF Form 8" },
    { value: "school_form", label: "School SIWES Form" },
    { value: "indemnity_form", label: "Indemnity Form" },
    { value: "monthly_clearance", label: "Monthly Clearance" },
    { value: "final_clearance", label: "Final Clearance" },
  ];
};

module.exports = { getComplianceRegistryTemplate };
