const mergeCompanyFields = (placement) => {
  if (!placement) return placement;
  const partner = placement.industryPartner;
  if (!partner) return placement;
  return {
    ...placement,
    companyName: partner.name || placement.companyName,
    companyAddress: partner.address || placement.companyAddress,
    companyEmail: partner.email || placement.companyEmail,
    companyPhone: partner.phone || placement.companyPhone,
    companyWebsite: partner.website || placement.companyWebsite,
    companySector: partner.sector || placement.companySector,
  };
};

module.exports = { mergeCompanyFields };
