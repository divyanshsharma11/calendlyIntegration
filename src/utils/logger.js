// src/utils/logger.js

const { createLogger, transports, format } = require("winston");
const path = require("path");
const fs = require("fs");

const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const customFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf((info) => {
    return `${info.timestamp} <CalendlyService> [${info.level
      .toUpperCase()
      .padEnd(7)}] => ${info.message}`;
  })
);

const baseLogger = createLogger({
  level: process.env.LOG_LEVEL || "debug",
  format: customFormat,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, "app.log"),
      level: "info",
    }),
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
  ],
  exitOnError: false,
});

class Logger {
  constructor(fnName, trace) {
    this.updateInfo(fnName, trace);
    if (fnName || trace) this.info("Start");
  }

  updateInfo(fnName, trace) {
    this.fnName = fnName;
    this.trace = trace;
  }

  _formatMsg(msg) {
    let prefix = "";
    if (this.fnName) prefix += `${this.fnName} | `;
    if (this.trace) prefix += `${this.trace} | `;
    return `${prefix}${msg}`;
  }

  _safeStringify(data) {
    try {
      return JSON.stringify(data).substring(0, 1500);
    } catch {
      return String(data);
    }
  }

  info(...msg) {
    const combined = msg
      .map((m) => (typeof m === "object" ? this._safeStringify(m) : m))
      .join(" || ");
    baseLogger.info(this._formatMsg(combined));
  }

  debug(...msg) {
    const combined = msg
      .map((m) => (typeof m === "object" ? this._safeStringify(m) : m))
      .join(" || ");
    baseLogger.debug(this._formatMsg(combined));
  }

  error(...msg) {
    const combined = msg
      .map((m) => (typeof m === "object" ? this._safeStringify(m) : m))
      .join(" || ");
    baseLogger.error(this._formatMsg(combined));
  }
}

module.exports = new Logger();
module.exports.Logger = Logger;
