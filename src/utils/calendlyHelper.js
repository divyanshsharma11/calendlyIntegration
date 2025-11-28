const axios = require("axios");
const UserToken = require("../../src/models/UserToken");
const { Logger } = require("../../src/utils/logger");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
} = require("../../src/constants/constants");

const BASE_URL = process.env.CALENDLY_API_BASE || "https://api.calendly.com";

// --- Fetch authenticated user (to get user URI) ---
const fetchCurrentUser = async (accessToken) => {
  const response = await axios.get(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data.resource.uri;
};

// --- Fetch ONE page of scheduled events ---
const fetchEventsPage = async (accessToken, userUri, nextCursor = null) => {
  const params = {
    count: 20,
    user: userUri,
  };

  if (nextCursor) params.page_token = nextCursor;

  const response = await axios.get(`${BASE_URL}/scheduled_events`, {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

// --- Fetch ALL scheduled events with pagination ---
const fetchAllEvents = async ({ mode = "incremental", pageLimit = 5 }) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.SYNC.FETCH_ALL_EVENTS}`
  );

  try {
    logger.info(`mode | ${mode || " "} || pageLimit | ${pageLimit}`);
    const tokenDoc = await UserToken.findOne().lean();
    if (!tokenDoc?.access_token) {
      throw new Error("Missing OAuth access token");
    }

    const accessToken = tokenDoc.access_token;

    logger.info(`accessToken || ${JSON.stringify(accessToken)}`);

    const userUri = await fetchCurrentUser(accessToken);

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

module.exports = {
  fetchAllEvents,
};
