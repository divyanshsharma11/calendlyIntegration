const UserToken = require("../../models/UserToken");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
} = require("../../constants/constants");

const saveTokens = async (data) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.AUTH.CALLBACK}`
  );
  const { tokens, userURI, currentOrganisation } = data;

  logger.debug("Saving Calendly tokens to database");

  const saved = await UserToken.findOneAndUpdate(
    { provider: "calendly" },
    {
      provider: "calendly",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      userURI: userURI,
      currentOrganisation: currentOrganisation,
    },
    { upsert: true, new: true }
  );

  logger.info("Calendly tokens saved in DB");

  return saved;
};

const getLatestUserToken = async () => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.AUTH.USER_TOKEN}`
  );
  return await UserToken.findOne().sort({ createdAt: -1 }).lean();
};
module.exports = {
  saveTokens,
  getLatestUserToken,
};
