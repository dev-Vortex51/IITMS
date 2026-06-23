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

// Helper to print metrics even when tests pass (bypasses Jest console capture)
const print = (m) => process.stderr.write(m + "\n");

describe("Performance — POST /api/v1/auth/login", () => {
  let app;

  beforeAll(() => {
    app = require("../../app");
  });

  it("sequential login requests", async () => {
    const SAMPLES = 10;
    const latencies = [];
    const start = Date.now();

    for (let i = 0; i < SAMPLES; i++) {
      const t0 = Date.now();
      await request(app)
        .post("/api/v1/auth/login")
        .send({ email: `user${i}@test.com`, password: "Test@1234" });
      latencies.push(Date.now() - t0);
    }

    const elapsed = Date.now() - start;
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const max = Math.max(...latencies);
    const min = Math.min(...latencies);
    const sorted = [...latencies].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    print(`\n  Sequential (${SAMPLES} requests):`);
    print(`  Avg: ${avg.toFixed(1)} ms | Min: ${min} ms | Max: ${max} ms`);
    print(`  p50: ${p50} ms | p95: ${p95} ms | p99: ${p99} ms`);
    print(`  Throughput: ${(SAMPLES / (elapsed / 1000)).toFixed(1)} req/sec`);

    expect(avg).toBeLessThan(5000);
  }, 30000);

  it("concurrent login requests", async () => {
    const CONCURRENT = 10;
    const start = Date.now();

    const results = await Promise.all(
      Array.from({ length: CONCURRENT }, (_, i) => {
        const t0 = Date.now();
        return request(app)
          .post("/api/v1/auth/login")
          .send({ email: `concurrent${i}@test.com`, password: "Test@1234" })
          .then(() => Date.now() - t0);
      }),
    );

    const elapsed = Date.now() - start;
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const max = Math.max(...results);
    const min = Math.min(...results);
    const sorted = [...results].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    print(`  Concurrent (${CONCURRENT} parallel requests):`);
    print(`  Avg: ${avg.toFixed(1)} ms | Min: ${min} ms | Max: ${max} ms`);
    print(`  p50: ${p50} ms | p95: ${p95} ms`);
    print(`  Total wall time: ${elapsed} ms`);
    print(`  Effective throughput: ${(CONCURRENT / (elapsed / 1000)).toFixed(1)} req/sec`);

    expect(avg).toBeLessThan(5000);
  }, 30000);

  it("GET /api/v1/health (baseline)", async () => {
    const SAMPLES = 10;
    const latencies = [];

    for (let i = 0; i < SAMPLES; i++) {
      const t0 = Date.now();
      await request(app).get("/api/v1/health");
      latencies.push(Date.now() - t0);
    }

    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);

    print(`  Health check (${SAMPLES} requests):`);
    print(`  Avg: ${avg.toFixed(1)} ms | Min: ${min} ms | Max: ${max} ms`);

    expect(avg).toBeLessThan(1000);
  }, 15000);
});
