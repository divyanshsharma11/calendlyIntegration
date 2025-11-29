const axios = require("axios");
const UserToken = require("../../src/models/UserToken");
const { Logger } = require("../../src/utils/logger");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
  UTILS,
} = require("../../src/constants/constants");

// --- Fetch ONE page of scheduled events ---
const fetchEventsPage = async (accessToken, userUri, nextCursor = null) => {
  const params = {
    count: 20,
    user: userUri,
  };

  if (nextCursor) params.page_token = nextCursor;
  const BASE_URL = process.env.CALENDLY_API_BASE || "https://api.calendly.com";

  const response = await axios.get(`${BASE_URL}/scheduled_events`, {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

// --- Fetch ALL scheduled events with pagination ---
const fetchAllEvents = async ({ pageLimit = 5 }) => {
  const logger = new Logger(
    `${ENTERING} ${UTILS} ${METHODS.SYNC.FETCH_ALL_EVENTS}`
  );

  try {
    logger.info(` pageLimit | ${pageLimit}`);
    const tokenDoc = await UserToken.findOne().lean();
    if (!tokenDoc?.access_token) {
      throw new Error("Missing OAuth access token");
    }

    const accessToken = tokenDoc.access_token;

    logger.info(`accessToken || ${JSON.stringify(accessToken)}`);

    const userUri = tokenDoc?.userURI;

    logger.info(`userUri || ${JSON.stringify(userUri)}`);

    let allEvents = [];
    let nextCursor = null;
    let pagesFetched = 0;

    do {
      const page = await fetchEventsPage(accessToken, userUri, nextCursor);
      logger.info(`page || ${JSON.stringify(page)}`);

      const eventsList = page.collection || [];
      allEvents = allEvents.concat(eventsList);

      nextCursor = page.pagination?.next_page_token || null;
      pagesFetched++;

      if (!nextCursor || pagesFetched >= pageLimit) break;
    } while (true);

    logger.info(
      `Fetched ${allEvents.length} events across ${pagesFetched} pages`
    );

    return allEvents;
  } catch (error) {
    logger.error(`Calendly Fetch Events Error | ${error.message}`);
    throw error;
  }
};
const createWebhookSubscription = async (accessToken, payload) => {
  const logger = new Logger(
    `${ENTERING} ${UTILS} ${METHODS.WEBHOOKS.CREATE_WEBHOOK_SUBSCRIPTION}`
  );

  try {
    logger.info(` webhook payload | ${JSON.stringify(payload)}`);

    const BASE_URL =
      process.env.CALENDLY_API_BASE || "https://api.calendly.com";

    const response = await axios.post(
      `${BASE_URL}/webhook_subscriptions`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    logger.info(
      `Calendly webhook subscription created | ${JSON.stringify(response.data)}`
    );

    return response.data?.resource;
  } catch (error) {
    logger.error(
      `Calendly Create Webhook Error | ${error.message} | ${JSON.stringify(
        error?.response?.data
      )}`
    );
    throw error;
  }
};

module.exports = {
  fetchAllEvents,
  createWebhookSubscription,
};
