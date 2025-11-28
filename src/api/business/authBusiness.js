const { sendResponse } = require("../../utils/response");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  BUSINESS_METHOD,
  METHODS,
} = require("../../constants/constants");
const { saveTokens } = require("../service/authService");
const axios = require("axios");

const getAuthorizeBusiness = async () => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.AUTH.AUTHORIZE_BUSINESS}`
  );

  logger.debug("Preparing Calendly authorize URL");

  const baseUrl = "https://auth.calendly.com/oauth/authorize";

  const params = new URLSearchParams({
    client_id: process.env.CALENDLY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.CALENDLY_REDIRECT_URI,
  });

  const authorizeUrl = `${baseUrl}?${params.toString()}`;

  logger.debug(`Authorize URL generated: ${authorizeUrl}`);

  return sendResponse(
    true,
    200,
    "Calendly authorize URL generated successfully",
    { authorizeUrl }
  );
};

const handleCallbackBusiness = async (query) => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.AUTH.CALLBACK}`
  );

  logger.debug("Processing OAuth callback");

  const { code } = query;

  if (!code) {
    throw new Error("Authorization code is required");
  }

  logger.debug(`Received authorization code: ${code}`);

  const tokenUrl = process.env.CALENDLY_OAUTH_TOKEN_URL;

  const payload = {
    grant_type: "authorization_code",
    client_id: process.env.CALENDLY_CLIENT_ID,
    client_secret: process.env.CALENDLY_CLIENT_SECRET,
    redirect_uri: process.env.CALENDLY_REDIRECT_URI,
    code,
  };

  logger.debug(`Sending token exchange request to ${tokenUrl}`);

  const response = await axios.post(tokenUrl, new URLSearchParams(payload), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const tokens = response.data;

  logger.debug("Token exchange response received");

  // --- Fetch authenticated user (to get user URI) ---
  let userData = await fetchCurrentUser(tokens.access_token);

  let dbPayload = {
    tokens,
    userURI: userData?.userURI,
    currentOrganisation: userData?.current_organization,
  };

  const saved = await saveTokens(dbPayload);

  logger.info("Tokens saved successfully");

  return sendResponse(
    true,
    200,
    "Tokens exchanged and saved successfully",
    saved
  );
};

module.exports = {
  getAuthorizeBusiness,
  handleCallbackBusiness,
};
// --- Fetch authenticated user (to get user URI) ---
const fetchCurrentUser = async (accessToken) => {
  const response = await axios.get(
    `${process.env.CALENDLY_API_BASE}/users/me`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  let data = {
    uri: response.data.resource.uri,
    current_organization: response.data.resource.current_organization,
  };

  return data;
};
