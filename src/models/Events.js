const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    calendlyEventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: String,
    status: String,
    startTime: Date,
    endTime: Date,
    eventType: String,
    location: Object,
    raw: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
