const mongoose = require("mongoose");

const UserTokenSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      default: "calendly",
    },
    access_token: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
      required: false,
    },
    expires_in: {
      type: Number,
      required: false,
    },
    userURI: {
      type: String,
      required: false,
    },
    currentOrganisation: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserToken", UserTokenSchema, "UserToken");
