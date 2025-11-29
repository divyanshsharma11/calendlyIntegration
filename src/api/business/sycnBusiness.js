const { Logger } = require("../../utils/logger");
const { sendResponse, errorFormat } = require("../../utils/response");
const {
  ENTERING,
  BUSINESS_METHOD,
  METHODS,
} = require("../../constants/constants");

const { bulkUpsertEventsService } = require("../service/syncService");
const { fetchAllEvents } = require("../../utils/calendlyHelper");

const syncEventsBusiness = async (payload) => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.SYNC.SYNC_EVENT_BUSINESS}`
  );

  try {
    logger.info(` payload | ${JSON.stringify(payload)}`);

    const pageLimit = parseInt(payload.pageLimit || 5, 10);

    const allEvents = await fetchAllEvents({ pageLimit });

    logger.info(` allEvents | ${JSON.stringify(allEvents)}`);

    const bulkOps = allEvents.map((ev) => {
      const eventId = ev?.uri ? ev.uri.split("/").pop() : undefined;

      return {
        updateOne: {
          filter: { calendlyEventId: eventId },
          update: {
            $set: {
              calendlyEventId: eventId,
              name: ev.name,
              status: ev.status,
              startTime: ev.start_time,
              endTime: ev.end_time,
              eventType: ev.event_type,
              location: ev.location,
              raw: ev,
            },
          },
          upsert: true,
        },
      };
    });

    logger.info(` bulkOps | ${JSON.stringify(bulkOps)}`);

    await bulkUpsertEventsService(bulkOps);

    return sendResponse(true, 200, "Events synced successfully", {
      totalEventsFetched: allEvents.length,
      totalEventsUpserted: bulkOps.length,
    });
  } catch (error) {
    const formatted = errorFormat(error);
    logger.error(`Sync Events Business Error | ${formatted.message}`);

    return sendResponse(
      false,
      formatted.status || 500,
      "Internal Server Error",
      null,
      formatted
    );
  }
};

module.exports = {
  syncEventsBusiness,
};
