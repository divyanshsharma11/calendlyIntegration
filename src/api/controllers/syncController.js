const { syncEventsBusiness } = require("../business/sycnBusiness");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  CONTROLLER_METHOD,
  METHODS,
} = require("../../constants/constants");

const syncEventsController = async (req, res, next) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.SYNC.SYNC_EVENT_CONTROLLER}`
  );

  const response = await syncEventsBusiness(req.query);

  logger.info(` response | ${JSON.stringify(response)}`);

  return res.status(response.status).json(response);
};

module.exports = {
  syncEventsController,
};
