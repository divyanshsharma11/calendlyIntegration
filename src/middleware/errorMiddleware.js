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
  try {
    const formatted = errorFormat(err);

    const status = err.status || formatted.status || 500;
    const message = formatted.message || "Internal Server Error";

    logger.error(`Status: ${status} || Message: ${message}`);
    if (formatted.stack) logger.debug(formatted.stack);

    return res
      .status(status)
      .json(sendResponse(false, status, message, null, formatted));
  } catch (middlewareErr) {
    logger.error(`Error inside errorMiddleware: ${formatted.message}`);

    return res.status(500).json(
      sendResponse(false, 500, "Internal Server Error", null, {
        message: middlewareErr.message,
        stack: middlewareErr.stack,
      })
    );
  }
}

module.exports = { errorMiddleware };
