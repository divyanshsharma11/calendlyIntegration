const { sendResponse } = require("../../utils/response");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  BUSINESS_METHOD,
  METHODS,
} = require("../../constants/constants");
const {
  getEventsFromDB,
  getEventByIdFromDB,
} = require("../service/eventsService");

const getEventsBusiness = async (query) => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.EVENTS.GET_EVENTS}`
  );

  logger.debug("Preparing filters and query parameters for events listing");

  const { page, limit, startDate, endDate, sort } = query;

  const filters = {};
  if (startDate) filters.startTime = { $gte: new Date(startDate) };
  if (endDate) {
    filters.endTime = filters.endTime || {};
    filters.endTime.$lte = new Date(endDate);
  }

  const sortOption = sort === "asc" ? 1 : -1;

  logger.debug(
    `Filters prepared: ${JSON.stringify(
      filters
    )}, page: ${page}, limit: ${limit}, sort: ${sort}`
  );

  const result = await getEventsFromDB(filters, sortOption, page, limit);

  logger.info("Events fetched successfully");

  return sendResponse(true, 200, "Events fetched successfully", result);
};

const getEventByIdBusiness = async (id = "") => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.EVENTS.GET_EVENTS_BY_ID}`
  );

  logger.debug(`Fetching event for ID: ${id}`);

  const event = await getEventByIdFromDB(id);

  if (!event) {
    logger.debug(`Event not found for ID: ${id}`);
    return sendResponse(false, 404, "Event not found", null);
  }

  logger.info("Event fetched successfully");

  return sendResponse(true, 200, "Event fetched successfully", event);
};

module.exports = {
  getEventsBusiness,
  getEventByIdBusiness,
};
