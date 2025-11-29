const WebhookSubscription = require("../../models/Webhook");
const WebhookLog = require("../../models/WebhookLog");
const { Logger } = require("../../utils/logger");
const { errorFormat } = require("../../utils/response");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
} = require("../../constants/constants");

const saveWebhookSubscription = async (data) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.WEBHOOKS.REGISTER_WEBHOOK}`
  );

  try {
    logger.info(` data | ${JSON.stringify(data)}`);

    const result = await WebhookSubscription.create(data);

    logger.info("Webhook subscription saved successfully");
    return result;
  } catch (error) {
    logger.error(`Error in saveWebhookSubscription: ${error.message}`);
    return Promise.reject(errorFormat(error));
  }
};

const saveWebhookLog = async (data) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.WEBHOOKS.RECEIVE_WEBHOOK}`
  );

  try {
    logger.info(` data | ${JSON.stringify(data)}`);

    const result = await WebhookLog.create(data);

    logger.info("Webhook log saved successfully");
    return result;
  } catch (error) {
    logger.error(`Error in saveWebhookLog: ${error.message}`);
    return Promise.reject(errorFormat(error));
  }
};

module.exports = {
  saveWebhookSubscription,
  saveWebhookLog,
};
