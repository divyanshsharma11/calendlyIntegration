const { Logger } = require("../../utils/logger");
const { errorFormat } = require("../../utils/response");
const {
  ENTERING,
  CONTROLLER_METHOD,
  METHODS,
} = require("../../constants/constants");
const {
  registerWebhookBusiness,
  handleWebhookReceiveBusiness,
} = require("../business/webhookBusiness");

const registerWebhookController = async (req, res, next) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.WEBHOOKS.REGISTER_WEBHOOK}`
  );

  try {
    const response = await registerWebhookBusiness();

    logger.info(` response | ${JSON.stringify(response)}`);

    return res.status(response.status).json(response);
  } catch (error) {
    const formatted = errorFormat(error);
    logger.error(`Error in registerWebhookController: ${formatted.message}`);

    return res.status(formatted.status || 500).json({
      success: false,
      message: formatted.message,
      error: formatted,
    });
  }
};

const receiveWebhookController = async (req, res, next) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.WEBHOOKS.RECEIVE_WEBHOOK}`
  );

  try {
    const response = await handleWebhookReceiveBusiness(req.body);

    logger.info(` response | ${JSON.stringify(response)}`);

    return res.status(response.status).json(response);
  } catch (error) {
    const formatted = errorFormat(error);
    logger.error(`Error in receiveWebhookController: ${formatted.message}`);

    return res.status(formatted.status || 500).json({
      success: false,
      message: formatted.message,
      error: formatted,
    });
  }
};

module.exports = {
  registerWebhookController,
  receiveWebhookController,
};
