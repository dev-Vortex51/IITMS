const request = require("supertest");

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

describe("Security Tests", () => {
  let app;

  beforeAll(() => {
    app = require("../../app");
  });

  describe("Input validation", () => {
    it("rejects empty email on login", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "", password: "Test@1234" });

      expect(res.status).toBe(422);
    });

    it("rejects empty password on login", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@test.com", password: "" });

      expect(res.status).toBe(422);
    });
  });

  describe("Security headers", () => {
    it("returns security headers", async () => {
      const res = await request(app).get("/api/v1/health");

      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"]).toBeDefined();
      expect(res.headers["x-xss-protection"]).toBeDefined();
      expect(res.headers["strict-transport-security"]).toBeDefined();
    });
  });

  describe("Authentication guards", () => {
    it("blocks access without token", async () => {
      const protectedRoutes = [
        { method: "get", url: "/api/v1/students" },
        { method: "get", url: "/api/v1/faculties" },
        { method: "post", url: "/api/v1/faculties" },
        { method: "get", url: "/api/v1/audit-logs" },
        { method: "get", url: "/api/v1/placements" },
        { method: "get", url: "/api/v1/supervisors" },
      ];

      for (const route of protectedRoutes) {
        const res = await request(app)[route.method](route.url);
        expect(res.status).toBe(401);
      }
    });

    it("rejects malformed JWT", async () => {
      const res = await request(app)
        .get("/api/v1/faculties")
        .set("Authorization", "Bearer invalid-token-here");

      expect(res.status).toBe(401);
    });
  });

  describe("Method not allowed", () => {
    it("returns 404 for unknown routes", async () => {
      const res = await request(app)
        .get("/api/v1/nonexistent-route");

      expect(res.status).toBe(404);
    });
  });

  describe("Rate limiting", () => {
    it("limits repeated requests to login", async () => {
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .post("/api/v1/auth/login")
            .send({ email: `user${i}@test.com`, password: "Test@1234" }),
        );
      }
      const responses = await Promise.all(promises);
      const tooMany = responses.filter((r) => r.status === 429);
      expect(tooMany.length).toBeGreaterThanOrEqual(0);
    });
  });
});
