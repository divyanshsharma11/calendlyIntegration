// src/middleware/webhookSignatureMiddleware.js
const crypto = require("crypto");
const { Logger } = require("../utils/logger");
const { sendResponse, errorFormat } = require("../utils/response");
const { ENTERING, MIDDLEWARE, METHODS } = require("../constants/constants");

const SIGNING_KEY = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

function webhookSignatureMiddleware(req, res, next) {
  const logger = new Logger(
    `${ENTERING} ${MIDDLEWARE} ${METHODS.MIDDLEWARES.WEBHOOK_SIGNATURE}`
  );

  try {
    if (
      !req.path.includes("/v1/webhook") ||
      req.path.includes("/v1/webhook/register")
    ) {
      return next();
    }

    if (!SIGNING_KEY) {
      logger.error("Missing CALENDLY_WEBHOOK_SIGNING_KEY");
      return res
        .status(500)
        .json(sendResponse(false, 500, "Webhook signing key not configured"));
    }

    console.log("headers=========>", req.headers);

    const signature = (req.headers["calendly-webhook-signature"] || "").trim();
    if (!signature) {
      logger.error("Missing Calendly-Webhook-Signature header");
      return res
        .status(401)
        .json(sendResponse(false, 401, "Invalid webhook signature"));
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      logger.error("Missing raw body for signature validation");
      return res.status(400).json(sendResponse(false, 400, "Raw body missing"));
    }

    // Compute HMAC SHA256
    const computedHex = crypto
      .createHmac("sha256", SIGNING_KEY)
      .update(rawBody)
      .digest("hex");

    // Safe constant-time compare
    let computedBuf, receivedBuf;
    try {
      computedBuf = Buffer.from(computedHex, "hex");
      receivedBuf = Buffer.from(signature, "hex");
    } catch {
      logger.error("Signature format invalid (not hex)");
      return res
        .status(401)
        .json(sendResponse(false, 401, "Invalid webhook signature"));
    }

    if (
      computedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(computedBuf, receivedBuf)
    ) {
      logger.error(
        `Webhook signature mismatch | expected: ${signature} | computed: ${computedHex}`
      );
      return res
        .status(401)
        .json(sendResponse(false, 401, "Invalid webhook signature"));
    }

    logger.info("Webhook signature validated successfully");
    next();
  } catch (err) {
    const formatted = errorFormat(err);
    logger.error(`Webhook Signature Error: ${formatted.message}`);

    return res
      .status(500)
      .json(
        sendResponse(
          false,
          500,
          "Webhook signature validation failed",
          null,
          formatted
        )
      );
  }
}

module.exports = { webhookSignatureMiddleware };
