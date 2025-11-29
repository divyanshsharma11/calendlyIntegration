const {
  getAuthorizeBusiness,
  handleCallbackBusiness,
} = require("../business/authBusiness");
const { errorFormat } = require("../../utils/response");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  CONTROLLER_METHOD,
  METHODS,
} = require("../../constants/constants");

const authorizeController = async (req, res, next) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.AUTH.AUTHORIZE_CONTROLLER}`
  );

  try {
    const response = await getAuthorizeBusiness();

    logger.info(` response | ${JSON.stringify(response)}`);

    return res.status(response.status).json(response);
  } catch (error) {
    const formatted = errorFormat(error);
    logger.error(`Error in authorizeController: ${formatted.message}`);

    return res
      .status(formatted.status || 500)
      .json({ success: false, message: formatted.message, error: formatted });
  }
};

const callbackController = async (req, res, next) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.AUTH.CALLBACK}`
  );

  try {
    const response = await handleCallbackBusiness(req.query);

    logger.info(` response | ${JSON.stringify(response)}`);

    return res.status(response.status).json(response);
  } catch (error) {
    const formatted = errorFormat(error);
    logger.error(`Error in callbackController: ${formatted.message}`);

    return res
      .status(formatted.status || 500)
      .json({ success: false, message: formatted.message, error: formatted });
  }
};

module.exports = {
  authorizeController,
  callbackController,
};
