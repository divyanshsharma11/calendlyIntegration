const axios = require("axios");
const retry = require("./retry");
const { Logger } = require("./logger");
const { ENTERING, METHODS, UTILS } = require("../constants/constants");

const logger = new Logger(
  `${ENTERING} ${UTILS} ${METHODS.UTILS.UTILS_HTTP_CLIENT}`
);

// Base Calendly API client
const calendlyClient = axios.create({
  baseURL: process.env.CALENDLY_API_BASE || "https://api.calendly.com",
  timeout: 15000,
});

// Wrapper to apply retry for ALL Calendly requests
async function calendlyRequest(config) {
  return retry(
    async () => {
      logger.info(`Calendly API Request | ${JSON.stringify(config)}`);
      const res = await calendlyClient(config);
      return res.data;
    },
    {
      retries: 3,
      delay: 300,
      retryStatusCodes: [429, 500, 502, 503, 504],
    }
  );
}

async function calendlyOAuthRequest(config) {
  return retry(
    async () => {
      logger.info(
        JSON.stringify({
          type: "CalendlyOAuthRequest",
          method: config.method,
          url: config.url,
        })
      );

      const res = await oauthClient(config);
      return res.data;
    },
    {
      retries: 3,
      delay: 300,
      retryStatusCodes: [429, 500, 502, 503, 504],
    }
  );
}

module.exports = {
  calendlyRequest,
  calendlyOAuthRequest,
};
