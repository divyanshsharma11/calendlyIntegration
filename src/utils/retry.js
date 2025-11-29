const { ENTERING, METHODS } = require("../constants/constants");
const { Logger } = require("./logger");

/**
 * Retry wrapper with exponential backoff.
 * Used mainly for Calendly API calls (429, 500, 502, 503, 504).
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry configuration
 * @param {number} options.retries - Number of retry attempts
 * @param {number} options.delay - Initial delay in ms
 * @param {number[]} options.retryStatusCodes - HTTP codes that trigger retry
 */
async function retry(fn, options = {}) {
  const {
    retries = 3,
    delay = 300, // starting delay
    retryStatusCodes = [429, 500, 502, 503, 504],
  } = options;

  const logger = new Logger(
    `${ENTERING} ${UTILS} ${METHODS.UTILS.UTILS_RETRY}`
  );
  new Logger("RetryUtility !! ");

  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.response?.status;

      if (!retryStatusCodes.includes(status) || attempt === retries) {
        logger.error(
          `Retry failed on attempt ${attempt} | Status: ${status} | Message: ${err.message}`
        );
        throw err;
      }

      const backoff = delay * Math.pow(2, attempt); // exponential growth

      logger.info(
        `Retrying request (attempt ${
          attempt + 1
        }/${retries}) after ${backoff}ms | Status: ${status}`
      );

      await new Promise((resolve) => setTimeout(resolve, backoff));
    }

    attempt++;
  }
}

module.exports = retry;
