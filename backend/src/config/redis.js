const Redis = require("ioredis");
const config = require("./index");
const logger = require("../utils/logger");

let redisClient = null;
let initAttempted = false;

const createRedisClient = () => {
  if (!config.redis.enabled) return null;

  const client = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  client.on("connect", () => {
    logger.info("Redis connected");
  });

  client.on("error", (error) => {
    logger.error(`Redis error: ${error.message}`);
  });

  return client;
};

const getRedisClient = async () => {
  if (!config.redis.enabled) return null;

  if (!redisClient) {
    redisClient = createRedisClient();
  }

  if (!redisClient) return null;

  if (redisClient.status === "ready") {
    return redisClient;
  }

  if (!initAttempted) {
    initAttempted = true;
    try {
      await redisClient.connect();
    } catch (error) {
      logger.error(`Failed to connect Redis: ${error.message}`);
    }
  }

  return redisClient.status === "ready" ? redisClient : null;
};

const closeRedisClient = async () => {
  if (!redisClient) return;

  try {
    await redisClient.quit();
  } catch (error) {
    logger.warn(`Redis quit failed: ${error.message}`);
  }
};

module.exports = {
  getRedisClient,
  closeRedisClient,
};
