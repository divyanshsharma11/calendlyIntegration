const { Logger } = require("../utils/logger");
const { ENTERING, CONFIG, METHODS } = require("../constants/constants");

const logger = new Logger(
  `${ENTERING} ${CONFIG} ${METHODS.REDIS_CONFIG.INIT_REDIS_CONNECTION}`
);

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
  logger.error(
    `Missing Redis configuration | host=${process.env.REDIS_HOST} | port=${process.env.REDIS_PORT}`
  );
}

const redisConfig = {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

logger.info(
  `Redis connection initialized | host=${redisConfig.connection.host} | port=${redisConfig.connection.port}`
);

module.exports = redisConfig;
