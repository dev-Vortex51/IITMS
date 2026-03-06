const nodemailer = require("nodemailer");
const logger = require("./logger");
const config = require("../config");

class EmailService {
  constructor() {
    this.transporter = null;
    this.provider = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      if (config.resend.apiKey) {
        this.provider = "resend";
        this.initialized = true;
        logger.info("Email service initialized with Resend API");
        return;
      }

      if (config.email.user && config.email.password) {
        this.transporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port,
          secure: config.email.secure,
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          auth: {
            user: config.email.user,
            pass: config.email.password,
          },
        });

        await this.transporter.verify();

        this.provider = "smtp";
        logger.info("SMTP email service initialized and verified");
      } else {
        if (process.env.NODE_ENV === "production") {
          throw new Error("SMTP credentials are not configured");
        }

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

        this.provider = "smtp";
        logger.info("Email service initialized with Ethereal test account");
      }

      this.initialized = true;
    } catch (error) {
      logger.error("Failed to initialize email service", error);
      this.initialized = false;
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }

  async sendInvitation(options) {
    await this.ensureInitialized();

    const { email, role, token, invitedBy } = options;

    const magicLink = `${config.frontendUrl}/invite/verify?token=${token}`;
    const expiresIn = "7 days";

    const roleNames = {
      coordinator: "Coordinator",
      academic_supervisor: "Academic Supervisor",
      student: "Student",
      industrial_supervisor: "Industrial Supervisor",
    };

    const roleName = roleNames[role] || role;

    const subject = `Invitation to join SIWES Management System as ${roleName}`;
    const html = `
      <html>
      <body style="font-family: Arial, sans-serif;">
      <h2>You've been invited!</h2>
      <p>${invitedBy.firstName} ${invitedBy.lastName} invited you to join as <strong>${roleName}</strong>.</p>

      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Role:</strong> ${roleName}</p>

      <p>This link expires in ${expiresIn}</p>

      <p>
      <a href="${magicLink}" style="padding:12px 20px;background:#667eea;color:white;text-decoration:none;border-radius:6px;">
      Complete Setup
      </a>
      </p>

      <p>Or open this link:</p>
      <p>${magicLink}</p>

      <p>© ${new Date().getFullYear()} SIWES Management System</p>
      </body>
      </html>
      `;
    const text = `
You've been invited to join the SIWES Management System.

${invitedBy.firstName} ${invitedBy.lastName} invited you as ${roleName}

Email: ${email}

Setup your account here:
${magicLink}

Link expires in ${expiresIn}
      `;

    try {
      const info = await this.dispatchEmail({
        to: email,
        subject,
        html,
        text,
      });

      logger.info(`Invitation email sent to ${email}`, {
        messageId: info.messageId,
        role,
      });

      if (process.env.NODE_ENV !== "production") {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          logger.info(`Preview URL: ${previewUrl}`);
        }
      }

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      logger.error("Failed to send invitation email", error);
      throw error;
    }
  }

  async sendPasswordReset(options) {
    await this.ensureInitialized();

    const { email, token } = options;
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;

    const subject = "Password Reset Request";
    const html = `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      `;
    const text = `
Password reset requested.

Reset link:
${resetUrl}

Valid for 1 hour.
      `;

    try {
      const info = await this.dispatchEmail({
        to: email,
        subject,
        html,
        text,
      });

      logger.info(`Password reset email sent to ${email}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      logger.error("Failed to send password reset email", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendWelcome(options) {
    await this.ensureInitialized();

    const { email, firstName, role } = options;

    const loginUrl = `${config.frontendUrl}/login`;

    const roleNames = {
      coordinator: "Coordinator",
      academic_supervisor: "Academic Supervisor",
      student: "Student",
      industrial_supervisor: "Industrial Supervisor",
    };

    const roleName = roleNames[role] || role;

    const subject = "Welcome to SIWES Management System";
    const html = `
      <h2>Welcome ${firstName}</h2>
      <p>Your account is ready.</p>
      <p>You are registered as <strong>${roleName}</strong>.</p>

      <p>
      <a href="${loginUrl}" style="padding:12px 20px;background:#667eea;color:white;text-decoration:none;">
      Login
      </a>
      </p>
      `;

    try {
      const info = await this.dispatchEmail({
        to: email,
        subject,
        html,
      });

      logger.info(`Welcome email sent to ${email}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      logger.error("Failed to send welcome email", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async resendInvitation(options) {
    return this.sendInvitation(options);
  }

  async dispatchEmail({ to, subject, html, text }) {
    await this.ensureInitialized();

    if (this.provider === "resend") {
      return this.sendWithResend({ to, subject, html, text });
    }

    return this.sendWithSmtp({ to, subject, html, text });
  }

  async sendWithSmtp({ to, subject, html, text }) {
    if (!this.transporter) {
      throw new Error("SMTP transporter not initialized");
    }

    return this.transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
      text,
    });
  }

  async sendWithResend({ to, subject, html, text }) {
    const from = config.resend.from || config.email.from;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resend.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Resend API error (${response.status}): ${details}`);
    }

    const data = await response.json();
    return { messageId: data?.id };
  }
}

module.exports = new EmailService();
