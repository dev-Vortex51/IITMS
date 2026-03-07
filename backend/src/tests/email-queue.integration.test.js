const state = {
  queues: [],
  workers: [],
};

jest.mock("bullmq", () => {
  class MockQueue {
    constructor(name) {
      this.name = name;
      this.jobs = [];
      state.queues.push(this);
    }

    async add(name, data, opts) {
      const job = {
        id: `${this.name}-${this.jobs.length + 1}`,
        name,
        data,
        opts,
        attemptsMade: 0,
      };
      this.jobs.push(job);
      return job;
    }

    async getJobCounts() {
      return {
        waiting: this.jobs.length,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      };
    }

    async close() {}
  }

  class MockWorker {
    constructor(name, processor, options) {
      this.name = name;
      this.processor = processor;
      this.options = options;
      this.handlers = {};
      state.workers.push(this);
    }

    on(event, handler) {
      this.handlers[event] = handler;
    }

    async emit(event, ...args) {
      if (this.handlers[event]) {
        await this.handlers[event](...args);
      }
    }

    async close() {}
  }

  class MockQueueEvents {
    constructor(name) {
      this.name = name;
      this.handlers = {};
    }

    on(event, handler) {
      this.handlers[event] = handler;
    }

    async close() {}
  }

  return {
    Queue: MockQueue,
    Worker: MockWorker,
    QueueEvents: MockQueueEvents,
  };
});

jest.mock("../utils/emailService", () => ({
  sendInvitation: jest.fn(async () => true),
  resendInvitation: jest.fn(async () => true),
  sendPasswordReset: jest.fn(async () => true),
  sendWelcome: jest.fn(async () => true),
}));

jest.mock("../config", () => ({
  isDevelopment: true,
  logging: {
    level: "error",
    file: "logs/test.log",
  },
  redis: {
    enabled: true,
    url: "redis://127.0.0.1:6379",
  },
  queue: {
    emailConcurrency: 2,
    failureAlertThreshold: 2,
    failureAlertWindowMs: 60_000,
  },
}));

describe("email queue integration", () => {
  let emailQueue;

  beforeEach(() => {
    jest.resetModules();
    state.queues = [];
    state.workers = [];
    emailQueue = require("../jobs/emailQueue");
  });

  afterEach(async () => {
    await emailQueue.stopEmailWorker();
  });

  it("enqueues jobs with retries and reports queue health", async () => {
    emailQueue.startEmailWorker();
    await emailQueue.enqueueEmailJob("invitation", { to: "user@example.com" });

    const health = await emailQueue.getQueueHealth();

    expect(health.enabled).toBe(true);
    expect(health.counts.waiting).toBe(1);
  });

  it("moves terminally failed jobs into dead-letter queue", async () => {
    emailQueue.startEmailWorker();
    await emailQueue.enqueueEmailJob("invitation", { to: "user@example.com" });

    const worker = state.workers[0];
    const mainQueue = state.queues.find((q) => q.name === "email-jobs");
    const job = mainQueue.jobs[0];
    job.attemptsMade = job.opts.attempts;

    await worker.emit("failed", job, new Error("SMTP timeout"));

    const dlq = state.queues.find((q) => q.name === "email-jobs-dlq");
    expect(dlq).toBeTruthy();
    expect(dlq.jobs.length).toBe(1);
    expect(dlq.jobs[0].data.reason).toContain("SMTP timeout");
  });
});
