const Event = require("../../models/Events");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
} = require("../../constants/constants");

const bulkUpsertEventsService = async (bulkOps) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.SYNC.SYNC_EVENT_BUSINESS}`
  );
  logger.info(` bulkOps | ${JSON.stringify(bulkOps)}`);

  if (!bulkOps || bulkOps.length === 0) return;

  return Event.bulkWrite(bulkOps, { ordered: false });
};

module.exports = {
  bulkUpsertEventsService,
};
