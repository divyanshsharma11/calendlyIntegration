const sendResponse = (success, status, message, data = null, error = null) => {
  const response = { success, status, message };
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;
  return response;
};

const errorFormat = (error) => {
  if (!error) {
    return { message: "Unknown error occurred" };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);
    return {
      type: "ValidationError",
      message: messages.join(", "),
      stack: error.stack || null,
    };
  }

  if (error.code && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      type: "MongoDuplicateKeyError",
      message: `Duplicate value for field '${field}'`,
      field,
      stack: error.stack || null,
    };
  }

  if (error instanceof Error) {
    return {
      type: error.name || "Error",
      message: error.message || "Unexpected server error",
      stack: error.stack || null,
    };
  }

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
