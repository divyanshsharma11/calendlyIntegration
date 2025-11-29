const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  BUSINESS_METHOD,
  METHODS,
} = require("../../constants/constants");

const { bulkUpsertEventsService } = require("../service/syncService");
const { fetchAllEvents } = require("../../utils/calendlyHelper");

const syncEventsBusiness = async (query) => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.SYNC.SYNC_EVENT_BUSINESS}`
  );

  try {
    logger.info(` query | ${JSON.stringify(query)}`);
    const mode = query.mode || "incremental";
    const pageLimit = parseInt(query.pageLimit || 5, 10);

    const allEvents = await fetchAllEvents({ mode, pageLimit });

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

    return {
      status: 200,
      success: true,
      message: "Events synced successfully",
      data: {
        totalEventsFetched: allEvents.length,
        totalEventsUpserted: bulkOps.length,
      },
    };
  } catch (error) {
    logger.error(`Sync Events Business Error | ${error.message}`);

    return {
      status: 500,
      success: false,
      message: "Internal Server Error",
    };
  }
};

module.exports = {
  syncEventsBusiness,
};
