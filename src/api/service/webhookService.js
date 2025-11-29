const WebhookSubscription = require("../../models/Webhook");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
} = require("../../constants/constants");

const saveWebhookSubscription = async (data) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.WEBHOOKS.REGISTER_WEBHOOK}`
  );
  logger.info(` data | ${JSON.stringify(data)}`);

  return await WebhookSubscription.create(data);
};

const saveWebhookLog = async (data) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.WEBHOOKS.RECEIVE_WEBHOOK}`
  );
  logger.info(` data | ${JSON.stringify(data)}`);

  return await WebhookLog.create(data);
};

module.exports = {
  saveWebhookSubscription,
  saveWebhookLog,
};
