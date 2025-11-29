const { Logger } = require("../utils/logger");
const { ENTERING, MIDDLEWARE, METHODS } = require("../constants/constants");
const { PUBLIC_ROUTES, SWAGGER_ROUTES } = require("./middlewareConstants");

async function authMiddleware(req, res, next) {
  const logger = new Logger(
    `${ENTERING} ${MIDDLEWARE} ${METHODS.MIDDLEWARES.AUTH_MIDDLEWARE}`
  );

  try {
    const path = req.path;

    if (PUBLIC_ROUTES.some((route) => path.startsWith(route))) {
      logger.debug(`Public route accessed: ${path}`);
      return next();
    }
    if (SWAGGER_ROUTES.some((route) => path.startsWith(route))) {
      logger.debug(`Swagger route accessed: ${path}`);
      return next();
    }
    const clientKey = req.headers["x-api-key"];
    const serverKey = process.env.API_KEY;

    if (clientKey && clientKey === serverKey) {
      logger.debug(`API key present for route : ${path}`);
      return next();
    }
    logger.error(`Blocked unauthorized access to: ${path}`);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: This endpoint is protected",
    });
  } catch (err) {
    logger.error(`Auth Middleware Error: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error in auth middleware",
    });
  }
}

module.exports = { authMiddleware };
