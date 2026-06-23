const { authService } = require("../../services");
const { createPrismaMock } = require("../utils/prismaMock");
const { mockUser } = require("../utils/testFactory");

jest.mock("../../config/prisma", () => {
  const { createPrismaMock } = require("../utils/prismaMock");
  const mock = createPrismaMock();
  return {
    getPrismaClient: jest.fn(() => mock),
    connectPrisma: jest.fn(),
    disconnectPrisma: jest.fn(),
    setupGracefulShutdown: jest.fn(),
  };
});

jest.mock("../../middleware/auth", () => ({
  generateToken: jest.fn(() => "mock-access-token"),
  generateRefreshToken: jest.fn(() => "mock-refresh-token"),
}));

jest.mock("../../utils/helpers", () => ({
  hashPassword: jest.fn((pwd) => `hashed-${pwd}`),
  comparePassword: jest.fn((plain, hash) => {
    if (plain === "Test@1234" && hash === "$2a$12$hashedpassword") return true;
    if (plain === "OldPassword@123") return true;
    if (plain === "NewPassword@456") return false;
    return false;
  }),
  sanitizeInput: jest.fn((x) => x),
  catchAsync: jest.fn((fn) => fn),
}));

jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("../../jobs/emailQueue", () => ({
  enqueueEmailJob: jest.fn(),
}));

jest.mock("../../utils/emailService", () => ({
  sendPasswordReset: jest.fn(),
}));

jest.mock("../../services/notificationService", () => ({
  createNotification: jest.fn(),
  createBulkNotifications: jest.fn(),
}));

describe("authService", () => {
  let mockPrisma;

  beforeEach(() => {
    jest.clearAllMocks();
    const { getPrismaClient } = require("../../config/prisma");
    mockPrisma = getPrismaClient();
  });

  describe("login", () => {
    it("logs in a user with valid credentials", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser());
      mockPrisma.student.findUnique.mockResolvedValue({ id: "student-123", department: null });

      const result = await authService.login("test@example.com", "Test@1234");

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken", "mock-access-token");
      expect(result).toHaveProperty("refreshToken", "mock-refresh-token");
      expect(result.user.email).toBe("test@example.com");
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-123" },
          data: expect.objectContaining({ lastLogin: expect.any(Date) }),
        }),
      );
    });

    it("rejects non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login("unknown@test.com", "Test@1234"),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("rejects inactive user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser({ isActive: false }));

      await expect(
        authService.login("inactive@test.com", "Test@1234"),
      ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining("deactivated") });
    });

    it("rejects invalid password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser());

      await expect(
        authService.login("test@example.com", "WrongPassword"),
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe("changePassword", () => {
    it("changes password with valid old password", async () => {
      const user = mockUser({ password: "$2a$12$hashedpassword" });
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({ ...user });

      const result = await authService.changePassword("user-123", "OldPassword@123", "NewPwd@123");

      expect(result).toHaveProperty("message");
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-123" },
          data: expect.objectContaining({ password: "hashed-NewPwd@123" }),
        }),
      );
    });

    it("rejects wrong old password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser({ password: "$2a$12$hashedpassword" }));

      await expect(
        authService.changePassword("user-123", "WrongOld", "NewPwd@123"),
      ).rejects.toMatchObject({ statusCode: 401, message: expect.stringContaining("incorrect") });
    });

    it("rejects if new password is same as old", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser({ password: "$2a$12$hashedpassword" }));

      await expect(
        authService.changePassword("user-123", "OldPassword@123", "OldPassword@123"),
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("different from current") });
    });
  });

  describe("forgotPassword", () => {
    it("generates reset token for existing user", async () => {
      const crypto = require("crypto");
      const mockToken = "abcdef123456";
      jest.spyOn(crypto, "randomBytes").mockReturnValue({ toString: () => mockToken });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser());

      await authService.forgotPassword("test@example.com");

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-123" },
          data: expect.objectContaining({
            passwordResetToken: mockToken,
            passwordResetExpires: expect.any(Date),
          }),
        }),
      );

      crypto.randomBytes.mockRestore();
    });

    it("silently succeeds for non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.forgotPassword("nonexistent@test.com"),
      ).resolves.toBeUndefined();
    });
  });
});
