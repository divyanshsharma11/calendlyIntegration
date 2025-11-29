const Event = require("../../models/Events");
const { Logger } = require("../../utils/logger");
const { errorFormat } = require("../../utils/response");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
} = require("../../constants/constants");

const bulkUpsertEventsService = async (bulkOps) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.SYNC.SYNC_EVENT_BUSINESS}`
  );

  try {
    logger.info(` bulkOps | ${JSON.stringify(bulkOps)}`);

    if (!bulkOps || bulkOps.length === 0) {
      logger.debug("No bulk operations provided — skipping upsert");
      return;
    }

    const result = await Event.bulkWrite(bulkOps, { ordered: false });

    logger.info("Bulk upsert events executed successfully");

    return result;
  } catch (error) {
    logger.error(`Error in bulkUpsertEventsService: ${error.message}`);
    return Promise.reject(errorFormat(error));
  }
};

module.exports = {
  bulkUpsertEventsService,
};
