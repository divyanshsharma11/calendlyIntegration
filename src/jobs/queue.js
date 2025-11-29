const { Queue } = require("bullmq");
const { Logger } = require("../utils/logger");
const { ENTERING, JOBS, METHODS } = require("../constants/constants");
const redisConfig = require("../config/redisConfig");

const logger = new Logger(
  `${ENTERING} ${JOBS} ${METHODS.WEBHOOKS.WORKER_QUEUE}`
);

const webhookQueue = new Queue("webhookQueue", {
  connection: redisConfig.connection,
});

logger.info("Webhook queue initialized");

module.exports = { webhookQueue };
