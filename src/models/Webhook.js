const mongoose = require("mongoose");

const WebhookSubscriptionSchema = new mongoose.Schema(
  {
    subscriptionURI: {
      type: String,
      required: true,
      index: true,
    },
    organization: {
      type: String,
      required: true,
    },
    events: {
      type: [String],
      default: [],
    },
    rawResponse: {
      type: Object,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model(
  "WebhookSubscription",
  WebhookSubscriptionSchema,
  "WebhookSubscription"
);
