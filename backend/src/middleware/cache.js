const { getRedisClient } = require("../config/redis");
const logger = require("../utils/logger");

const defaultSerializer = {
  parse: (value) => JSON.parse(value),
  stringify: (value) => JSON.stringify(value),
};

const buildCacheKey = (req) => {
  const actor = req.user?.id || "anon";
  return `api-cache:${actor}:${req.originalUrl}`;
};

const scanAndDelete = async (redis, pattern) => {
  let cursor = "0";
  let deleted = 0;

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      200,
    );
    cursor = nextCursor;

    if (keys.length > 0) {
      deleted += await redis.del(...keys);
    }
  } while (cursor !== "0");

  return deleted;
};

const invalidateCachePatterns = async (patterns = []) => {
  if (!Array.isArray(patterns) || patterns.length === 0) return 0;

  const redis = await getRedisClient();
  if (!redis) return 0;

  let totalDeleted = 0;
  for (const pattern of patterns) {
    if (!pattern) continue;
    totalDeleted += await scanAndDelete(redis, pattern);
  }

  return totalDeleted;
};

const invalidateApiReadCache = async ({ userId } = {}) => {
  const patterns = ["api-cache:*"];
  if (userId) {
    patterns.push(`api-cache:${userId}:*`);
  }
  return invalidateCachePatterns(patterns);
};

const cacheResponse = (ttlSeconds = 60, serializer = defaultSerializer) => {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.query?.nocache === "true") return next();

    const redis = await getRedisClient();
    if (!redis) return next();

    const key = buildCacheKey(req);

    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.status(200).json(serializer.parse(cached));
      }
    } catch (_error) {
      return next();
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis
          .set(key, serializer.stringify(body), "EX", ttlSeconds)
          .catch(() => null);
      }
      return originalJson(body);
    };

    return next();
  };
};

const invalidateCacheOnWrite = () => {
  return (req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
      return next();
    }

    res.on("finish", async () => {
      if (res.statusCode < 200 || res.statusCode >= 400) return;

      try {
        await invalidateApiReadCache({ userId: req.user?.id });
      } catch (error) {
        logger.warn(`Cache invalidation failed: ${error.message}`);
      }
    });

    return next();
  };
};

module.exports = {
  cacheResponse,
  invalidateCachePatterns,
  invalidateApiReadCache,
  invalidateCacheOnWrite,
};
