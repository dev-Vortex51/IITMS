const BRAND = {
  name: "IITMS",
  accentBlue: "#1f4fa3",
  accentGold: "#d4a63d",
};

function renderMetaRows(rows = []) {
  if (!rows.length) return "";

  const items = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">${row.label}</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${row.value}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#f8fafc;">
      ${items}
    </table>
  `;
}

function renderEmailLayout({
  title,
  subtitle,
  messageHtml,
  ctaLabel,
  ctaUrl,
  metaRows,
  footerMessage,
}) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:24px;background:#f4f6fb;font-family:Segoe UI,Arial,sans-serif;color:#111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="background:${BRAND.accentBlue};padding:20px 24px;border-bottom:4px solid ${BRAND.accentGold};">
                    <h1 style="margin:0;font-size:18px;line-height:1.3;color:#ffffff;letter-spacing:0.3px;">${BRAND.name}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;">
                    <h2 style="margin:0 0 10px 0;font-size:22px;line-height:1.3;color:#0f172a;">${title}</h2>
                    ${
                      subtitle
                        ? `<p style="margin:0 0 16px 0;color:#475569;font-size:14px;line-height:1.6;">${subtitle}</p>`
                        : ""
                    }
                    <div style="font-size:14px;line-height:1.7;color:#1f2937;">
                      ${messageHtml}
                    </div>
                    ${renderMetaRows(metaRows)}
                    ${
                      ctaLabel && ctaUrl
                        ? `<p style="margin:22px 0 0 0;">
                            <a href="${ctaUrl}" style="display:inline-block;padding:11px 18px;background:${BRAND.accentBlue};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                              ${ctaLabel}
                            </a>
                          </p>`
                        : ""
                    }
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 24px;background:#f8fafc;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                      ${footerMessage || "This is an automated message from IITMS."}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

module.exports = {
  renderEmailLayout,
};
