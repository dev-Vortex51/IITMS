const request = require("supertest");

jest.mock("../../config/prisma", () => {
  const { createPrismaMock } = require("../utils/prismaMock");
  const mock = createPrismaMock();
  mock.user.findUnique.mockResolvedValue(null);
  return {
    getPrismaClient: jest.fn(() => mock),
    connectPrisma: jest.fn(),
    disconnectPrisma: jest.fn(),
    setupGracefulShutdown: jest.fn(),
  };
});

jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("../../jobs/emailQueue", () => ({
  enqueueEmailJob: jest.fn(),
  getQueue: jest.fn(() => null),
  getDeadLetterQueue: jest.fn(() => null),
  getQueueHealth: jest.fn(() => ({})),
  startEmailWorker: jest.fn(),
  stopEmailWorker: jest.fn(),
}));

jest.mock("../../utils/emailService", () => ({ sendPasswordReset: jest.fn() }));
jest.mock("../../services/notificationService", () => ({
  createNotification: jest.fn(),
  createBulkNotifications: jest.fn(),
}));

describe("Auth Routes", () => {
  let app;

  beforeAll(() => {
    app = require("../../app");
  });

  describe("POST /api/v1/auth/login", () => {
    it("returns 400 for missing credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it("returns 401 for invalid credentials", async () => {
      const { getPrismaClient } = require("../../config/prisma");
      getPrismaClient().user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "wrong@test.com", password: "WrongPwd@123" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/auth/profile", () => {
    it("returns 401 without token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/profile");

      expect(res.status).toBe(401);
    });
  });
});
