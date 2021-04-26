const path = require("path");
const util = require("util");
const { createLogger, format, transports, info } = require("winston");
const { logpath, loglevel } = require("../config.json");
require("winston-daily-rotate-file");

function getLogger(name) {
  return new createLogger({
    level: loglevel || "info",
    levels: {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      trace: 4,
      debug: 5,
    },
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.label({ label: name }),
      format.printf(
        ({ label, timestamp, level, message }) => {
          return `[${label} - ${process.pid}] [${timestamp}] [${level}] ${
            util.format(message.err || message)
          }`
        }
      )
    ),
    transports: [
      new transports.Console(),
      new transports.DailyRotateFile({
        filename: path.resolve(logpath, "application-%DATE%.log"),
        datePattern: "YYYY-MM-DD-HH",
        zippedArchive: false,
        maxSize: "1024m",
        timestamp: true,
        maxFiles: "1d",
        prepend: true,
      }),
    ],
    exitOnError: false,
  });
}

module.exports = getLogger;
