const { renderEmailLayout } = require("./baseTemplate");

function buildPasswordResetTemplate({ resetUrl }) {
  const subject = "Reset your IITMS password";

  const html = renderEmailLayout({
    title: "Password reset request",
    subtitle: "Use this secure link to set a new password for your account.",
    messageHtml: `
      <p style="margin:0 0 10px 0;">
        We received a request to reset your IITMS password.
      </p>
      <p style="margin:0;">
        For security reasons, this link expires in 1 hour.
      </p>
    `,
    ctaLabel: "Reset Password",
    ctaUrl: resetUrl,
    metaRows: [{ label: "Valid For", value: "1 hour" }],
    footerMessage:
      "If you did not request a password reset, you can safely ignore this email.",
  });

  const text = [
    "Password reset request for IITMS.",
    "",
    "Use this link to reset your password (valid for 1 hour):",
    resetUrl,
  ].join("\n");

  return { subject, html, text };
}

module.exports = {
  buildPasswordResetTemplate,
};
