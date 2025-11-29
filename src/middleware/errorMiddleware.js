const { Logger } = require("../utils/logger");
const { sendResponse, errorFormat } = require("../utils/response");
const { ENTERING, MIDDLEWARE, METHODS } = require("../constants/constants");

/**
 * Global error handler middleware.
 * All thrown or forwarded errors will get processed here.
 */
function errorMiddleware(err, req, res, next) {
  const logger = new Logger(
    `${ENTERING} ${MIDDLEWARE} ${METHODS.MIDDLEWARES.ERROR_MIDDLEWARE}`
  );
  console.log("err===========>", err);

  const formatted = errorFormat(err);

  const status = err.status || formatted.status || 500;
  const message = formatted.message || "Internal Server Error";

  logger.error(`Status: ${status} || Message: ${message}`);
  if (formatted.stack) logger.debug(formatted.stack);

  return res
    .status(status)
    .json(sendResponse(false, status, message, null, formatted));
}

module.exports = { errorMiddleware };
