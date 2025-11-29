const { createClient } = require("redis");
const redisConfig = require("../config/redisConfig"); // ❗ your file stays SAME
const { Logger } = require("../utils/logger");

const logger = new Logger("REDIS-CONNECTION");

const redis = createClient({
  socket: {
    host: redisConfig.connection.host,
    port: redisConfig.connection.port,
  },
  password: redisConfig.connection.password,
});

redis.on("error", (err) => {
  logger.error(`Redis Error: ${err.message}`);
});

redis
  .connect()
  .then(() => logger.info("Redis connected successfully"))
  .catch((err) => logger.error(`Redis connection failed: ${err.message}`));

// ---------------------------------------------------
// 🔥 getCache + setCache helpers
// ---------------------------------------------------

async function getCache(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.error(`getCache error for key=${key} | ${err.message}`);
    return null;
  }
}

async function setCache(key, value, ttlSeconds = 3600) {
  try {
    const jsonValue = JSON.stringify(value);

    await redis.set(key, jsonValue, {
      EX: ttlSeconds,
    });

    return true;
  } catch (err) {
    logger.error(`setCache error for key=${key} | ${err.message}`);
    return false;
  }
}

module.exports = {
  redis,
  getCache,
  setCache,
};
