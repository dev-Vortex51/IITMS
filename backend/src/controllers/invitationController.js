const invitationService = require("../services/invitationService");
const { formatResponse } = require("../utils/helpers");
const { ApiError } = require("../middleware/errorHandler");

/**
 * Create a new invitation
 * @route POST /api/v1/invitations
 */
exports.createInvitation = async (req, res, next) => {
  try {
    const invitation = await invitationService.createInvitation(
      req.user,
      req.body
    );

    res
      .status(201)
      .json(
        formatResponse(
          true,
          "Invitation created successfully. Magic link sent to email.",
          invitation
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all invitations
 * @route GET /api/v1/invitations
 */
exports.getInvitations = async (req, res, next) => {
  try {
    const { status, role, email } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (role) filters.role = role;
    if (email) filters.email = email;

    const invitations = await invitationService.getInvitations(
      req.user,
      filters
    );

    res.json(
      formatResponse(true, "Invitations retrieved successfully", invitations)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get invitation by ID
 * @route GET /api/v1/invitations/:id
 */
exports.getInvitationById = async (req, res, next) => {
  try {
    const invitation = await invitationService.getInvitationById(
      req.params.id,
      req.user
    );

    res.json(
      formatResponse(true, "Invitation retrieved successfully", invitation)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify invitation token (public route)
 * @route GET /api/v1/invitations/verify/:token
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const invitation = await invitationService.verifyToken(req.params.token);

    // Return minimal data needed for setup form
    const data = {
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      department: invitation.metadata?.department,
      expiresAt: invitation.expiresAt,
    };

    res.json(formatResponse(true, "Invitation verified successfully", data));
  } catch (error) {
    next(error);
  }
};

/**
 * Complete first-time setup (public route)
 * @route POST /api/v1/invitations/complete-setup
 */
exports.completeSetup = async (req, res, next) => {
  try {
    const { token, ...userData } = req.body;

    if (!token) {
      throw new ApiError(400, "Invitation token is required");
    }

    const user = await invitationService.completeSetup(token, userData);

    res
      .status(201)
      .json(
        formatResponse(
          true,
          "Account created successfully. You can now login.",
          user
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Resend invitation
 * @route POST /api/v1/invitations/:id/resend
 */
exports.resendInvitation = async (req, res, next) => {
  try {
    const invitation = await invitationService.resendInvitation(
      req.params.id,
      req.user
    );

    res.json(
      formatResponse(true, "Invitation resent successfully", invitation)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel invitation
 * @route DELETE /api/v1/invitations/:id
 */
exports.cancelInvitation = async (req, res, next) => {
  try {
    const invitation = await invitationService.cancelInvitation(
      req.params.id,
      req.user
    );

    res.json(
      formatResponse(true, "Invitation cancelled successfully", invitation)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get invitation statistics
 * @route GET /api/v1/invitations/stats
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await invitationService.getStatistics(req.user);

    res.json(formatResponse(true, "Statistics retrieved successfully", stats));
  } catch (error) {
    next(error);
  }
};

/**
 * Cleanup expired invitations (admin only)
 * @route POST /api/v1/invitations/cleanup
 */
exports.cleanupExpired = async (req, res, next) => {
  try {
    const count = await invitationService.cleanupExpired();

    res.json(
      formatResponse(true, `Cleaned up ${count} expired invitations`, { count })
    );
  } catch (error) {
    next(error);
  }
};
