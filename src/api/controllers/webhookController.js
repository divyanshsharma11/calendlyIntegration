const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  CONTROLLER_METHOD,
  METHODS,
} = require("../../constants/constants");
const { registerWebhookBusiness } = require("../business/webhookBusiness");

const registerWebhookController = async (req, res, next) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.WEBHOOKS.REGISTER_WEBHOOK}`
  );

  const response = await registerWebhookBusiness();
  logger.info(` response | ${JSON.stringify(response)}`);

  return res.status(response.status).json(response);
};

const receiveWebhookController = async (req, res, next) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.WEBHOOKS.RECEIVE_WEBHOOK}`
  );

  const response = await handleWebhookReceiveBusiness(req.body);

  logger.info(` response | ${JSON.stringify(response)}`);

  return res.status(response.status).json(response);
};

module.exports = {
  receiveWebhookController,
};
module.exports = {
  registerWebhookController,
  receiveWebhookController,
};
