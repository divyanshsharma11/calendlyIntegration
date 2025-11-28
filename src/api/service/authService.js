const UserToken = require("../../models/UserToken");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  SERVICE_METHOD,
  METHODS,
} = require("../../constants/constants");

const saveTokens = async (tokens) => {
  const logger = new Logger(
    `${ENTERING} ${SERVICE_METHOD} ${METHODS.AUTH.CALLBACK}`
  );

  logger.debug("Saving Calendly tokens to database");

  const saved = await UserToken.findOneAndUpdate(
    { provider: "calendly" },
    {
      provider: "calendly",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      created_at: new Date(),
    },
    { upsert: true, new: true }
  );

  logger.info("Calendly tokens saved in DB");

  return saved;
};

module.exports = {
  saveTokens,
};
