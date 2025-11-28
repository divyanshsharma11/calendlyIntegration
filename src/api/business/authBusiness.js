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
    scope: "users:read scheduled_events:read organization:read",
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

  const saved = await saveTokens(tokens);

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
