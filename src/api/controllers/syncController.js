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

  try {
    const body = req.body || {};

    const pageLimit = Number.isFinite(Number(body.pageLimit))
      ? parseInt(body.pageLimit, 10)
      : 5;

    const payload = { pageLimit };

    logger.info(` request body | ${JSON.stringify(body)}`);

    const response = await syncEventsBusiness(payload);

    logger.info(` response | ${JSON.stringify(response)}`);

    return res.status(response.status).json(response);
  } catch (err) {
    logger.error(`Sync Events Controller Error | ${err.message}`);
    return next(err);
  }
};

module.exports = {
  syncEventsController,
};
