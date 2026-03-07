const mockRedis = {
  store: new Map(),
  deleted: [],
  async get(key) {
    return this.store.get(key) || null;
  },
  async set(key, value) {
    this.store.set(key, value);
    return "OK";
  },
  async scan(_cursor, _match, pattern) {
    const prefix = pattern.replace("*", "");
    const keys = [...this.store.keys()].filter((key) => key.startsWith(prefix));
    return ["0", keys];
  },
  async del(...keys) {
    keys.forEach((key) => this.store.delete(key));
    this.deleted.push(...keys);
    return keys.length;
  },
};

jest.mock("../config/redis", () => ({
  getRedisClient: jest.fn(async () => mockRedis),
}));

const {
  cacheResponse,
  invalidateCacheOnWrite,
} = require("../middleware/cache");

const createRes = () => {
  const listeners = {};
  return {
    statusCode: 200,
    body: null,
    on(event, handler) {
      listeners[event] = handler;
    },
    async emit(event) {
      if (listeners[event]) {
        await listeners[event]();
      }
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return payload;
    },
  };
};

describe("cache middleware integration", () => {
  beforeEach(() => {
    mockRedis.store.clear();
    mockRedis.deleted = [];
  });

  it("serves cached responses on subsequent GET calls", async () => {
    const middleware = cacheResponse(60);
    const req = {
      method: "GET",
      originalUrl: "/api/v1/reports/data",
      query: {},
      user: { id: "user-1" },
    };
    const res1 = createRes();
    let executed = false;

    await middleware(req, res1, () => {
      executed = true;
      res1.json({ value: 1 });
    });

    expect(executed).toBe(true);

    const res2 = createRes();
    executed = false;
    await middleware(req, res2, () => {
      executed = true;
      res2.json({ value: 2 });
    });

    expect(executed).toBe(false);
    expect(res2.body).toEqual({ value: 1 });
  });

  it("invalidates cache after successful writes", async () => {
    mockRedis.store.set("api-cache:user-1:/api/v1/reports/data", JSON.stringify({ value: 1 }));
    mockRedis.store.set("api-cache:user-2:/api/v1/reports/data", JSON.stringify({ value: 2 }));

    const middleware = invalidateCacheOnWrite();
    const req = {
      method: "POST",
      user: { id: "user-1" },
    };
    const res = createRes();

    await middleware(req, res, () => {});
    await res.emit("finish");

    expect(mockRedis.deleted.length).toBeGreaterThan(0);
    expect(mockRedis.store.size).toBe(0);
  });

  it("stays stable under repeated cache hits (load-like)", async () => {
    const middleware = cacheResponse(60);
    const req = {
      method: "GET",
      originalUrl: "/api/v1/reports/data",
      query: {},
      user: { id: "user-1" },
    };

    let handlerCalls = 0;
    const run = async () => {
      const res = createRes();
      await middleware(req, res, () => {
        handlerCalls += 1;
        res.json({ value: 99 });
      });
      return res.body;
    };

    await run();
    const results = await Promise.all(Array.from({ length: 40 }, () => run()));

    expect(handlerCalls).toBe(1);
    expect(results.every((item) => item.value === 99)).toBe(true);
  });
});
