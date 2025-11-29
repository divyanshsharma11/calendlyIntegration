const { Logger } = require("./logger");

const sendResponse = (success, status, message, data = null, error = null) => {
  const logger = new Logger("SEND_RESPONSE");

  const response = { success, status, message };
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;

  logger.info(
    `Response | success=${success} | status=${status} | message=${message}`
  );

  if (data) logger.debug(`Response data: ${JSON.stringify(data)}`);
  if (error) logger.error(`Response error: ${JSON.stringify(error)}`);

  return response;
};

const errorFormat = (error) => {
  const logger = new Logger("ERROR_FORMAT");

  if (!error) {
    logger.error(`Unknown error occurred`);
    return { message: "Unknown error occurred" };
  }

  if (typeof error === "string") {
    logger.error(`String error: ${error}`);
    return { message: error };
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);

    logger.error(`ValidationError: ${messages.join(", ")}`);

    return {
      type: "ValidationError",
      message: messages.join(", "),
      stack: error.stack || null,
    };
  }

  if (error.code && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];

    logger.error(`Duplicate key error on field '${field}'`);

    return {
      type: "MongoDuplicateKeyError",
      message: `Duplicate value for field '${field}'`,
      field,
      stack: error.stack || null,
    };
  }

  if (error instanceof Error) {
    logger.error(
      `Error instance | name=${error.name} | message=${error.message}`
    );

    return {
      type: error.name || "Error",
      message: error.message || "Unexpected server error",
      stack: error.stack || null,
    };
  }

  logger.error(
    `Custom error object | message=${error.message} | status=${error.status}`
  );

  return {
    type: error.type || "CustomError",
    message: error.message || "Unknown error",
    status: error.status || 500,
    details: error.details || null,
  };
};

module.exports = {
  sendResponse,
  errorFormat,
};
