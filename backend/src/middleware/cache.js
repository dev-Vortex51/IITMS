const { getRedisClient } = require("../config/redis");

const defaultSerializer = {
  parse: (value) => JSON.parse(value),
  stringify: (value) => JSON.stringify(value),
};

const buildCacheKey = (req) => {
  const actor = req.user?.id || "anon";
  return `api-cache:${actor}:${req.originalUrl}`;
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

module.exports = {
  cacheResponse,
};
