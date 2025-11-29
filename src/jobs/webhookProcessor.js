const { Worker } = require("bullmq");

const WebhookLog = require("../models/WebhookLog");
require("dotenv").config();
const { Logger } = require("../utils/logger");
const { ENTERING, JOBS, METHODS } = require("../constants/constants");
const redisConfig = require("../config/redisConfig");

const logger = new Logger(
  `${ENTERING} ${JOBS} ${METHODS.WEBHOOKS.WEBHOOK_PROCESSOR}`
);

const worker = new Worker(
  "webhookQueue",
  async (job) => {
    logger.info(`Processing webhook job | ${JSON.stringify(job.data)}`);

    const { logId, event, organization, eventUri } = job.data;

    const log = await WebhookLog.findById(logId);
    if (!log) {
      logger.error(`Webhook log not found for ID: ${logId}`);
      return;
    }

    try {
      if (event === "invitee.created") {
        logger.info("Processing invitee.created webhook");
        // Future: fetch event from Calendly & upsert into DB
      }

      if (event === "invitee.canceled") {
        logger.info("Processing invitee.canceled webhook");
        // Future: mark event as canceled or re-sync event
      }

      log.processed = true;
      await log.save();

      logger.info(`Webhook processed successfully | logId=${logId}`);
    } catch (err) {
      logger.error(
        `Webhook processing failed | logId=${logId} | error=${err.message}`
      );
      throw err;
    }
  },
  {
    connection: redisConfig.connection,
  }
);

worker.on("completed", (job) => {
  logger.info(`Job completed | jobId=${job.id}`);
});

worker.on("failed", (job, err) => {
  logger.error(`Job failed | jobId=${job?.id} | error=${err.message}`);
});

module.exports = { worker };
