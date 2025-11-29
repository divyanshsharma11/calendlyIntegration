const Event = require("../../models/Events");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
} = require("../../constants/constants");

const getEventsFromDB = async (filters, sortOption, page, limit) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.EVENTS.GET_EVENTS}`
  );

  logger.debug(
    `Fetching events from DB with filters: ${JSON.stringify(
      filters
    )}, page: ${page}, limit: ${limit}, sort: ${sortOption}`
  );

  const skip = (page - 1) * limit;

  const events = await Event.find(filters)
    .sort({ startTime: sortOption })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Event.countDocuments(filters);

  logger.info("Events fetched from DB successfully");

  return {
    events,
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

const getEventByIdFromDB = async (id) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.EVENTS.GET_EVENTS_BY_ID}`
  );
  logger.debug(`Fetching events from DB for id : ${JSON.stringify(id)}`);
  let options = { _id: id };

  const event = await Event.find(options).lean();

  return event;
};

module.exports = {
  getEventsFromDB,
  getEventByIdFromDB,
};
