const Event = require("../../models/Events");
const { Logger } = require("../../utils/logger");
const { errorFormat } = require("../../utils/response");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
} = require("../../constants/constants");

const getEventsFromDB = async (filters, sortOption, page, limit) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.EVENTS.GET_EVENTS}`
  );

  try {
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
  } catch (error) {
    logger.error(`Error in getEventsFromDB: ${error.message}`);
    return Promise.reject(errorFormat(error));
  }
};

const getEventByIdFromDB = async (id) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.EVENTS.GET_EVENTS_BY_ID}`
  );

  try {
    logger.debug(`Fetching event from DB for id : ${JSON.stringify(id)}`);

    const event = await Event.find({ _id: id }).lean();

    logger.info("Event fetched from DB successfully");
    return event;
  } catch (error) {
    logger.error(`Error in getEventByIdFromDB: ${error.message}`);
    return Promise.reject(errorFormat(error));
  }
};

const updateEventInDB = async (query, update, options = {}) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.EVENTS.UPDATE_EVENT}`
  );

  try {
    logger.debug(
      `Updating event in DB | query: ${JSON.stringify(
        query
      )} | update: ${JSON.stringify(update)} | options: ${JSON.stringify(
        options
      )}`
    );

    const result = await Event.updateOne(query, update, options);

    logger.info("Event updated in DB successfully");
    return result;
  } catch (error) {
    logger.error(`Error in updateEventInDB: ${error.message}`);
    return Promise.reject(errorFormat(error));
  }
};

module.exports = {
  getEventsFromDB,
  getEventByIdFromDB,
  updateEventInDB,
};
