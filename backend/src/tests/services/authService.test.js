/**
 * Authentication Service Tests
 * Unit tests for authentication business logic
 */

const { authService } = require("../../services");
const { User, Student } = require("../../models");
const { ApiError } = require("../../middleware/errorHandler");

describe("Authentication Service", () => {
  describe("login", () => {
    it("should login user with valid credentials", async () => {
      // Create test user
      const user = await User.create({
        email: "test@example.com",
        password: "Test@1234",
        firstName: "Test",
        lastName: "User",
        role: "student",
        isFirstLogin: false,
        passwordResetRequired: false,
      });

      const result = await authService.login("test@example.com", "Test@1234");

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should require password reset on first login", async () => {
      const user = await User.create({
        email: "newuser@example.com",
        password: "Test@1234",
        firstName: "New",
        lastName: "User",
        role: "student",
        isFirstLogin: true,
      });

      const result = await authService.login(
        "newuser@example.com",
        "Test@1234"
      );

      expect(result.requiresPasswordReset).toBe(true);
      expect(result.isFirstLogin).toBe(true);
    });

    it("should reject invalid credentials", async () => {
      await User.create({
        email: "test@example.com",
        password: "Test@1234",
        firstName: "Test",
        lastName: "User",
        role: "student",
      });

      await expect(
        authService.login("test@example.com", "WrongPassword")
      ).rejects.toThrow(ApiError);
    });

    it("should reject inactive users", async () => {
      await User.create({
        email: "inactive@example.com",
        password: "Test@1234",
        firstName: "Inactive",
        lastName: "User",
        role: "student",
        isActive: false,
      });

      await expect(
        authService.login("inactive@example.com", "Test@1234")
      ).rejects.toThrow("deactivated");
    });
  });

  describe("resetPasswordFirstLogin", () => {
    it("should reset password on first login", async () => {
      const user = await User.create({
        email: "newuser@example.com",
        password: "Default@123",
        firstName: "New",
        lastName: "User",
        role: "student",
        isFirstLogin: true,
        passwordResetRequired: true,
      });

      const result = await authService.resetPasswordFirstLogin(
        user._id,
        "NewPassword@123"
      );

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isFirstLogin).toBe(false);
      expect(updatedUser.passwordResetRequired).toBe(false);
    });
  });

  describe("changePassword", () => {
    it("should change password with valid old password", async () => {
      const user = await User.create({
        email: "test@example.com",
        password: "OldPassword@123",
        firstName: "Test",
        lastName: "User",
        role: "student",
        isFirstLogin: false,
      });

      await authService.changePassword(
        user._id,
        "OldPassword@123",
        "NewPassword@456"
      );

      const updatedUser = await User.findById(user._id).select("+password");
      const isMatch = await updatedUser.comparePassword("NewPassword@456");
      expect(isMatch).toBe(true);
    });

    it("should reject wrong old password", async () => {
      const user = await User.create({
        email: "test@example.com",
        password: "OldPassword@123",
        firstName: "Test",
        lastName: "User",
        role: "student",
      });

      await expect(
        authService.changePassword(user._id, "WrongPassword", "NewPassword@456")
      ).rejects.toThrow("incorrect");
    });
  });
});
