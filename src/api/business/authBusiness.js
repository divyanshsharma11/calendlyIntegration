const { sendResponse, errorFormat } = require("../../utils/response");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  BUSINESS_METHOD,
  METHODS,
} = require("../../constants/constants");
const { saveTokens } = require("../service/authService");
const {
  calendlyOAuthRequest,
  calendlyRequest,
} = require("../../utils/httpClient");

const getAuthorizeBusiness = async () => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.AUTH.AUTHORIZE_BUSINESS}`
  );

  try {
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
  } catch (error) {
    const formatted = errorFormat(error);
    logger.error(`Error in getAuthorizeBusiness: ${formatted.message}`);

    return sendResponse(
      false,
      500,
      "Error generating authorize URL",
      null,
      formatted
    );
  }
};

const handleCallbackBusiness = async (query) => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.AUTH.CALLBACK}`
  );

  try {
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

    const response = await calendlyOAuthRequest({
      method: "POST",
      url: tokenUrl,
      data: new URLSearchParams(payload),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const tokens = response.data;

    logger.debug("Token exchange response received");

    // --- Fetch authenticated user (to get user URI) ---
    const userData = await fetchCurrentUser(tokens.access_token);
    if (!userData) {
      logger.debug(`userData found for ID: ${id}`);
      return sendResponse(false, 404, "userData not found", null);
    }

    const dbPayload = {
      tokens,
      userURI: userData?.uri,
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
  } catch (error) {
    const formatted = errorFormat(error);
    logger.error(`Error in handleCallbackBusiness: ${formatted.message}`);

    return sendResponse(
      false,
      500,
      "Error processing Calendly callback",
      null,
      formatted
    );
  }
};

module.exports = {
  getAuthorizeBusiness,
  handleCallbackBusiness,
};

// --- Fetch authenticated user (to get user URI) ---
const fetchCurrentUser = async (accessToken) => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.AUTH.FETCH_CURRENT_USER}`
  );

  try {
    const response = await calendlyRequest({
      method: "GET",
      url: "/users/me",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      uri: response.data.resource.uri,
      current_organization: response.data.resource.current_organization,
    };
  } catch (error) {
    const formatted = errorFormat(error);
    logger.error(`Error in fetchCurrentUser: ${formatted.message}`);
    return null;
  }
};
