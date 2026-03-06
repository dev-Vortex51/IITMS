const { renderEmailLayout } = require("./baseTemplate");

const ROLE_NAMES = {
  coordinator: "Coordinator",
  academic_supervisor: "Academic Supervisor",
  student: "Student",
  industrial_supervisor: "Industrial Supervisor",
};

function buildInvitationTemplate({ email, role, invitedBy, magicLink, expiresIn }) {
  const roleName = ROLE_NAMES[role] || role;
  const subject = `Invitation to join IITMS as ${roleName}`;

  const html = renderEmailLayout({
    title: "You have been invited",
    subtitle:
      "Complete your account setup to access the internship management workspace.",
    messageHtml: `
      <p style="margin:0 0 10px 0;">
        ${invitedBy.firstName} ${invitedBy.lastName} invited you to join IITMS.
      </p>
      <p style="margin:0;">
        Use the secure link below to create your account and continue onboarding.
      </p>
    `,
    ctaLabel: "Complete Setup",
    ctaUrl: magicLink,
    metaRows: [
      { label: "Invited Email", value: email },
      { label: "Assigned Role", value: roleName },
      { label: "Link Expires", value: expiresIn },
    ],
    footerMessage:
      "If you did not expect this invitation, you can ignore this email.",
  });

  const text = [
    "You have been invited to IITMS.",
    "",
    `${invitedBy.firstName} ${invitedBy.lastName} invited you as ${roleName}.`,
    `Email: ${email}`,
    `Expires: ${expiresIn}`,
    "",
    "Complete setup:",
    magicLink,
  ].join("\n");

  return { subject, html, text };
}

module.exports = {
  buildInvitationTemplate,
};
