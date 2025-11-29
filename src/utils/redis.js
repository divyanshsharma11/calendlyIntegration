const { createClient } = require("redis");
const redisConfig = require("../config/redisConfig");
const { Logger } = require("../utils/logger");
const { errorFormat } = require("../utils/response");

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

async function getCache(key) {
  const opLogger = new Logger("REDIS-GET");

  try {
    opLogger.debug(`Fetching cache for key=${key}`);

    const data = await redis.get(key);

    return data ? JSON.parse(data) : null;
  } catch (error) {
    opLogger.error(`getCache error for key=${key} | ${error.message}`);
    return Promise.reject(errorFormat(error));
  }
}

async function setCache(key, value, ttlSeconds = 3600) {
  const opLogger = new Logger("REDIS-SET");

  try {
    opLogger.debug(`Saving cache key=${key}`);

    const jsonValue = JSON.stringify(value);

    await redis.set(key, jsonValue, { EX: ttlSeconds });

    return true;
  } catch (error) {
    opLogger.error(`setCache error for key=${key} | ${error.message}`);
    return Promise.reject(errorFormat(error));
  }
}

module.exports = {
  redis,
  getCache,
  setCache,
};
