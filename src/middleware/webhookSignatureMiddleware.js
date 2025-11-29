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
    const signatureHeader = req.headers["calendly-webhook-signature"];
    if (!signatureHeader) {
      logger.error("Missing Calendly-Webhook-Signature header");
      return res
        .status(401)
        .json(sendResponse(false, 401, "Invalid webhook signature"));
    }

    const SIGNING_KEY = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
    if (!SIGNING_KEY) {
      logger.error("Missing CALENDLY_WEBHOOK_SIGNING_KEY");
      return res
        .status(500)
        .json(sendResponse(false, 500, "Webhook signing key not configured"));
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      return res
        .status(400)
        .json({ success: false, message: "Raw body missing" });
    }

    const parts = signatureHeader.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
    const signature = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

    if (!timestamp || !signature) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid signature header format" });
    }

    const signedPayload = `${timestamp}.${rawBody}`;

    const expectedSignature = crypto
      .createHmac("sha256", SIGNING_KEY)
      .update(signedPayload)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "hex");
    const receivedBuf = Buffer.from(signature, "hex");

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      {
        logger.error(
          `Webhook signature mismatch | expected: ${signature} | computed: ${computedHex}`
        );
        return res
          .status(401)
          .json(sendResponse(false, 401, "Invalid webhook signature"));
      }
    }
    logger.info("Webhook signature validated successfully");

    return next();
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
