const { sendResponse } = require("../../utils/response");
const { Logger } = require("../../utils/logger");
const {
  ENTERING,
  BUSINESS_METHOD,
  METHODS,
} = require("../../constants/constants");
const UserToken = require("../../models/UserToken");
const {
  saveWebhookSubscription,
  saveWebhookLog,
} = require("../../api/service/webhookService");

const { webhookQueue } = require("../../jobs/queue");
const { createWebhookSubscription } = require("../../utils/calendlyHelper");
const { getLatestUserToken } = require("../service/authService");
const { getCache, setCache } = require("../../utils/redis");

const registerWebhookBusiness = async () => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.WEBHOOKS.REGISTER_WEBHOOK}`
  );

  logger.debug("Starting webhook subscription registration");

  const user = await getLatestUserToken();
  //   console.log("user data ==========>", user); remove
  if (!user || !user?.access_token) {
    logger.error("Missing user token");
    return sendResponse(false, 400, "Missing Calendly access token", null);
  }

  if (!user.currentOrganisation) {
    logger.error("Missing organization URI");
    return sendResponse(false, 400, "Missing organization URI", null);
  }

  logger.debug("Preparing Calendly webhook subscription payload");

  const payload = {
    url: `${process.env.PUBLIC_BASE_URL}api/v1/webhooks/receive`,
    organization: user.currentOrganisation,
    events: ["invitee.created", "invitee.canceled"],
    scope: "organization",
    signing_key: process.env.CALENDLY_SIGNING_KEY,
  };

  logger.debug("Calling Calendly API to create webhook subscription");

  const calendlyResponse = await createWebhookSubscription(
    user.access_token,
    payload
  );

  logger.debug("Calendly webhook subscription created");
  const webhookId = calendlyResponse.uri.split("/").pop();

  const saved = await saveWebhookSubscription({
    subscriptionURI: webhookId,
    organization: user.currentOrganisation,
    events: payload.events,
    rawResponse: calendlyResponse,
  });

  logger.info("Webhook subscription saved successfully");

  return sendResponse(
    true,
    200,
    "Webhook subscription created successfully",
    saved
  );
};

const handleWebhookReceiveBusiness = async (payload) => {
  const logger = new Logger(
    `${ENTERING} ${BUSINESS_METHOD} ${METHODS.WEBHOOKS.RECEIVE_WEBHOOK}`
  );

  try {
    logger.debug("Processing Calendly webhook payload");

    if (!payload) {
      logger.error("No webhook payload received");
      return sendResponse(false, 400, "Invalid webhook payload", null);
    }

    logger.debug(`Webhook payload received | ${JSON.stringify(payload)}`);
    const event = payload.event;
    const inviteeUri = payload?.payload?.uri;

    const inviteeUuid = inviteeUri.split("/").pop();
    const redisKey = `calendly_${event}_${inviteeUuid}`;

    const alreadyProcessed = await getCache(redisKey);

    if (alreadyProcessed) {
      logger.info(`Duplicate webhook ignored for invitee: ${inviteeUuid}`);

      return sendResponse(
        true,
        200,
        "Duplicate webhook ignored for invitee",
        null
      );
    }

    await setCache(redisKey, true, 86400); // 24 hours TTL

    logger.info(`Processing Calendly webhook for invitee: ${inviteeUuid}`);

    const organization = payload.payload?.organization;
    const eventUri = payload.payload?.event || payload.payload?.scheduled_event;

    const logEntry = await saveWebhookLog({
      event,
      organization,
      eventUri,
      payload,
    });

    logger.info("Webhook log saved successfully");

    // Enqueue job for background processing
    await webhookQueue.add("processWebhook", {
      logId: logEntry._id,
      event,
      payload,
      eventUri,
    });

    logger.info("Webhook enqueued for processing");

    // Respond immediately (never block Calendly)
    return sendResponse(true, 200, "Webhook received successfully", null);
  } catch (error) {
    logger.error(`Error processing webhook | ${error.message}`);

    return sendResponse(
      false,
      500,
      "Webhook processing failed",
      null,
      error.message
    );
  }
};

module.exports = {
  registerWebhookBusiness,
  handleWebhookReceiveBusiness,
};
