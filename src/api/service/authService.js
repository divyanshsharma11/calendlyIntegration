const UserToken = require("../../models/UserToken");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
} = require("../../constants/constants");
const { errorFormat } = require("../../utils/response");

const saveTokens = async (data) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.AUTH.CALLBACK}`
  );

  try {
    logger.debug("Saving Calendly tokens to database");

    const { tokens, userURI, currentOrganisation } = data;

    const saved = await UserToken.findOneAndUpdate(
      { provider: "calendly" },
      {
        provider: "calendly",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        userURI,
        currentOrganisation,
      },
      { upsert: true, new: true }
    );

    logger.info("Calendly tokens saved in DB");
    return saved;
  } catch (error) {
    logger.error(`Error in saveTokens: ${error.message}`);
    return Promise.reject(errorFormat(error));
  }
};

const getLatestUserToken = async () => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.AUTH.USER_TOKEN}`
  );

  try {
    logger.debug("Fetching latest user token");

    const token = await UserToken.findOne().sort({ createdAt: -1 }).lean();

    logger.info("Latest user token fetched successfully");
    return token;
  } catch (error) {
    logger.error(`Error in getLatestUserToken: ${error.message}`);
    return Promise.reject(errorFormat(error));
  }
};

module.exports = {
  saveTokens,
  getLatestUserToken,
};
