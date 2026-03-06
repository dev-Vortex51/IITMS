const nodemailer = require("nodemailer");
const logger = require("./logger");
const config = require("../config");
const {
  buildInvitationTemplate,
  buildPasswordResetTemplate,
  buildWelcomeTemplate,
} = require("../../templates/email");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
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

    const template = buildInvitationTemplate({
      email,
      role,
      invitedBy,
      magicLink,
      expiresIn,
    });

    try {
      const info = await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
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

    const template = buildPasswordResetTemplate({ resetUrl });

    try {
      const info = await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
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

    const template = buildWelcomeTemplate({
      firstName,
      role,
      loginUrl,
    });

    try {
      const info = await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
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
}

module.exports = new EmailService();
