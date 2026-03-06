const { renderEmailLayout } = require("./baseTemplate");

const ROLE_NAMES = {
  coordinator: "Coordinator",
  academic_supervisor: "Academic Supervisor",
  student: "Student",
  industrial_supervisor: "Industrial Supervisor",
};

function buildWelcomeTemplate({ firstName, role, loginUrl }) {
  const roleName = ROLE_NAMES[role] || role;
  const subject = "Welcome to IITMS";

  const html = renderEmailLayout({
    title: `Welcome, ${firstName}`,
    subtitle: "Your account is active and ready to use.",
    messageHtml: `
      <p style="margin:0 0 10px 0;">
        You are now registered on IITMS as <strong>${roleName}</strong>.
      </p>
      <p style="margin:0;">
        Sign in to access your dashboard and continue your workflow.
      </p>
    `,
    ctaLabel: "Go to Login",
    ctaUrl: loginUrl,
    metaRows: [{ label: "Role", value: roleName }],
  });

  const text = [
    `Welcome to IITMS, ${firstName}.`,
    `Role: ${roleName}`,
    "",
    "Sign in here:",
    loginUrl,
  ].join("\n");

  return { subject, html, text };
}

module.exports = {
  buildWelcomeTemplate,
};
