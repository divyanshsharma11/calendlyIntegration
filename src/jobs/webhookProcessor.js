const { Worker } = require("bullmq");

const WebhookLog = require("../models/WebhookLog");
require("dotenv").config();
const { Logger } = require("../utils/logger");
const { ENTERING, JOBS, METHODS } = require("../constants/constants");
const redisConfig = require("../config/redisConfig");
const connectDB = require("../config/db");
const { updateEventInDB } = require("../api/service/eventsService");
const retry = require("../utils/retry");

connectDB();

const logger = new Logger(
  `${ENTERING} ${JOBS} ${METHODS.WEBHOOKS.WEBHOOK_PROCESSOR}`
);

const worker = new Worker(
  "webhookQueue",
  async (job) => {
    logger.info(`Processing webhook job | ${JSON.stringify(job.data)}`);

    const { logId, event } = job.data;

    const log = await WebhookLog.findById(logId);
    if (!log) {
      logger.error(`Webhook log not found for ID: ${logId}`);
      return;
    }

    try {
      // WRAPPING MAIN PROCESSING IN RETRY
      await retry(
        async () => {
          if (event === "invitee.created" || event === "invitee.canceled") {
            logger.info(`Processing ${event} webhook`);

            const body = job.data;
            const eventData = body?.payload?.payload?.scheduled_event;
            const invitee = body?.payload?.payload;

            if (!eventData || !invitee) return;

            const eventId = eventData?.uri
              ? eventData.uri.split("/").pop()
              : undefined;

            const update = {
              $set: {
                calendlyEventId: eventId,
                name: eventData?.name,
                status: eventData?.status,
                startTime: eventData?.start_time,
                endTime: eventData?.end_time,
                eventType: eventData?.event_type,
                location: eventData?.location,
                raw: eventData,
              },
            };

            const options = { upsert: true };

            // Critical DB write wrapped in retry
            await updateEventInDB(
              { calendlyEventId: eventId },
              update,
              options
            );
          }
        },
        { retries: 3, delay: 300 } // optional overrides
      );

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
