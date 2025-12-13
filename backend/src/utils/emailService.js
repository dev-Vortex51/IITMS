const nodemailer = require("nodemailer");
const logger = require("./logger");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.initialize();
  }

  async initialize() {
    try {
      // Configure email transporter
      // In production, use actual SMTP credentials
      if (process.env.NODE_ENV === "production") {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        logger.info("Email service initialized with production SMTP");
      } else {
        // For development, use ethereal email (test account)
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info("Email service initialized with test account");
      }
      this.initialized = true;
    } catch (error) {
      logger.error("Failed to initialize email service", error);
      this.initialized = false;
    }
  }

  /**
   * Send magic link invitation email
   * @param {Object} options - Email options
   */
  async sendInvitation(options) {
    // Ensure email service is initialized
    if (!this.initialized || !this.transporter) {
      logger.warn("Email service not yet initialized, skipping email send");
      return {
        success: false,
        message: "Email service not initialized",
      };
    }

    const { email, role, token, invitedBy } = options;

    const magicLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/invite/verify?token=${token}`;
    const expiresIn = "7 days";

    const roleNames = {
      coordinator: "Coordinator",
      academic_supervisor: "Academic Supervisor",
      student: "Student",
      industrial_supervisor: "Industrial Supervisor",
    };

    const roleName = roleNames[role] || role;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"SIWES Management" <noreply@siwes.edu>',
      to: email,
      subject: `Invitation to join SIWES Management System as ${roleName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 20px;
                text-align: center;
                color: #ffffff;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                padding: 40px 30px;
              }
              .content h2 {
                color: #333;
                font-size: 22px;
                margin-bottom: 20px;
              }
              .content p {
                margin-bottom: 15px;
                color: #555;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
              }
              .button:hover {
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
              }
              .info-box {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                background: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                color: #777;
                font-size: 14px;
              }
              .footer a {
                color: #667eea;
                text-decoration: none;
              }
              .security-note {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 SIWES Management</h1>
              </div>
              
              <div class="content">
                <h2>You've been invited!</h2>
                
                <p>Hello,</p>
                
                <p>${invitedBy.firstName} ${
        invitedBy.lastName
      } has invited you to join the SIWES Management System as a <strong>${roleName}</strong>.</p>
                
                <div class="info-box">
                  <p style="margin: 0;"><strong>Your Email:</strong> ${email}</p>
                  <p style="margin: 10px 0 0 0;"><strong>Role:</strong> ${roleName}</p>
                </div>
                
                <p>Click the button below to complete your account setup. This link will expire in <strong>${expiresIn}</strong>.</p>
                
                <div style="text-align: center;">
                  <a href="${magicLink}" class="button">Complete Setup →</a>
                </div>
                
                <p style="margin-top: 25px;">Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #667eea; font-size: 14px;">${magicLink}</p>
                
                <div class="security-note">
                  <strong>🔒 Security Notice:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>This link is for one-time use only</li>
                    <li>Never share this link with anyone</li>
                    <li>If you didn't expect this invitation, please ignore this email</li>
                  </ul>
                </div>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} SIWES Management System. All rights reserved.</p>
                <p>If you have any questions, please contact <a href="mailto:support@siwes.edu">support@siwes.edu</a></p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
You've been invited to join SIWES Management System!

${invitedBy.firstName} ${
        invitedBy.lastName
      } has invited you to join as a ${roleName}.

Your Email: ${email}
Role: ${roleName}

Complete your account setup by clicking this link:
${magicLink}

This link will expire in ${expiresIn}.

Security Notice:
- This link is for one-time use only
- Never share this link with anyone
- If you didn't expect this invitation, please ignore this email

© ${new Date().getFullYear()} SIWES Management System
      `.trim(),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`Invitation email sent to ${email}`, {
        messageId: info.messageId,
        role,
      });

      // In development, log the preview URL
      if (process.env.NODE_ENV !== "production") {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          logger.info(`Preview URL: ${previewUrl}`);
        }
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl:
          process.env.NODE_ENV !== "production"
            ? nodemailer.getTestMessageUrl(info)
            : null,
      };
    } catch (error) {
      logger.error("Failed to send invitation email", error);
      throw error;
    }
  }

  /**
   * Send invitation resend notification
   * @param {Object} options - Email options
   */
  async resendInvitation(options) {
    // Same as sendInvitation but with different subject/body
    return this.sendInvitation(options);
  }

  /**
   * Send welcome email after account creation
   * @param {Object} options - Email options
   */
  async sendWelcome(options) {
    // Ensure email service is initialized
    if (!this.initialized || !this.transporter) {
      logger.warn("Email service not yet initialized, skipping email send");
      return {
        success: false,
        message: "Email service not initialized",
      };
    }

    const { email, firstName, role } = options;

    const loginUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/login`;

    const roleNames = {
      coordinator: "Coordinator",
      academic_supervisor: "Academic Supervisor",
      student: "Student",
      industrial_supervisor: "Industrial Supervisor",
    };

    const roleName = roleNames[role] || role;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"SIWES Management" <noreply@siwes.edu>',
      to: email,
      subject: "Welcome to SIWES Management System!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
              .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to SIWES Management!</h1>
              </div>
              <div class="content">
                <p>Hi ${firstName},</p>
                <p>Your account has been successfully created! You can now access the SIWES Management System as a <strong>${roleName}</strong>.</p>
                <div style="text-align: center;">
                  <a href="${loginUrl}" class="button">Login to Dashboard</a>
                </div>
                <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} SIWES Management System</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error("Failed to send welcome email", error);
      // Don't throw - welcome email is not critical
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
