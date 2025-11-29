const express = require("express");
const http = require("http");
const path = require("path");
const YAML = require("yamljs");
const swaggerTools = require("swagger-tools");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const logger = require("./src/utils/logger");
const connectDB = require("./src/config/db");
const { authMiddleware } = require("./src/middleware/authMiddleware");
const {
  webhookSignatureMiddleware,
} = require("./src/middleware/webhookSignatureMiddleware");
const { errorMiddleware } = require("./src/middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

// === DB Connection ====
connectDB();

// == Capture raw body for Webhook Signature ==
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(cors());

const swaggerDoc = YAML.load(path.join(__dirname, "./src/api/swagger.yaml"));

const swaggerOptions = {
  swaggerUi: "/api/docs",
  controllers: path.join(__dirname, "./src/api/controllers"),
};

swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
  app.use(middleware.swaggerMetadata());

  app.use(middleware.swaggerValidator());

  app.use(authMiddleware);

  app.use(webhookSignatureMiddleware);
  app.use(middleware.swaggerRouter(swaggerOptions));
  app.use("/api", middleware.swaggerUi());
});

// === Global Error Handler ===
app.use(errorMiddleware);

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
const URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

server.listen(PORT, () => {
  logger.info(`Server running at ${URL}`);
  logger.info(`Swagger UI available at ${URL}/api/docs`);
});

module.exports = app;
