const {
  getAuthorizeBusiness,
  handleCallbackBusiness,
} = require("../business/authBusiness");
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

  const response = await getAuthorizeBusiness();

  logger.info(` response | ${JSON.stringify(response)}`);

  return res.status(response.status).json(response);
};

const callbackController = async (req, res, next) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.AUTH.CALLBACK}`
  );

  const response = await handleCallbackBusiness(req.query);
  logger.info(` response | ${JSON.stringify(response)}`);

  return res.status(response.status).json(response);
};

module.exports = {
  authorizeController,
  callbackController,
};
