const { Logger } = require("../../utils/logger");
const { errorFormat } = require("../../utils/response");
const {
  ENTERING,
  CONTROLLER_METHOD,
  METHODS,
} = require("../../constants/constants");
const {
  getEventsBusiness,
  getEventByIdBusiness,
} = require("../business/eventsBusiness");

const getEventsController = async (req, res) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.EVENTS.GET_EVENTS}`
  );

  try {
    const response = await getEventsBusiness(req.query);

    logger.info(` response | ${JSON.stringify(response)}`);

    return res.status(response.status).json(response);
  } catch (error) {
    const formatted = errorFormat(error);
    logger.error(`Error in getEventsController: ${formatted.message}`);

    return res
      .status(formatted.status || 500)
      .json({ success: false, message: formatted.message, error: formatted });
  }
};

const getEventByIdController = async (req, res) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.EVENTS.GET_EVENTS_BY_ID}`
  );

  try {
    console.log(req.body, req.params, req.query);

    const response = await getEventByIdBusiness(req?.query?.id);

    logger.info(` response | ${JSON.stringify(response)}`);

    return res.status(response.status).json(response);
  } catch (error) {
    const formatted = errorFormat(error);
    logger.error(`Error in getEventByIdController: ${formatted.message}`);

    return res
      .status(formatted.status || 500)
      .json({ success: false, message: formatted.message, error: formatted });
  }
};

module.exports = {
  getEventsController,
  getEventByIdController,
};
