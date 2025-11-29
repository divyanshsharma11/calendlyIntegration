const mongoose = require("mongoose");

const WebhookLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },
    organization: {
      type: String,
      required: false,
    },
    eventUri: {
      type: String,
      required: false,
    },
    payload: {
      type: Object,
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebhookLog", WebhookLogSchema, "WebhookLog");
