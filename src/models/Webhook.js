const mongoose = require("mongoose");

const WebhookSubscriptionSchema = new mongoose.Schema(
  {
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
