const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  CONTROLLER_METHOD,
  METHODS,
} = require("../../constants/constants");
const {
  getEventsBusiness,
  getEventByIdBusiness,
} = require("../business/eventsBusiness");

const getEventsController = async (req, res, next) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.EVENTS.GET_EVENTS}`
  );

  const response = await getEventsBusiness(req.query);

  logger.info(` response | ${JSON.stringify(response)}`);

  return res.status(response.status).json(response);
};

const getEventByIdController = async (req, res, next) => {
  const logger = new Logger(
    `${ENTERING} ${CONTROLLER_METHOD} ${METHODS.EVENTS.GET_EVENTS_BY_ID}`
  );

  console.log(req.body, req.params, req.query);

  const response = await getEventByIdBusiness(req?.query?.id);

  logger.info(` response | ${JSON.stringify(response)}`);

  return res.status(response.status).json(response);
};

module.exports = {
  getEventsController,
  getEventByIdController,
};
