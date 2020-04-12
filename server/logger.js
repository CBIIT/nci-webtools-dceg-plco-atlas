/**
 * Log output from Express JS and R Wrapper
 */

'use strict';

const winston = require('winston');
const { createLogger, format, transports } = winston;
const { logpath, loglevel } = require('./config.json');
require('winston-daily-rotate-file');
// winston.emitErrs = true;


var logger = new createLogger({
  level: loglevel || 'info',
  format: format.combine(
    format.errors({ stack: true }), // <-- use errors format
    // format.colorize(),
    format.timestamp(),
    format.prettyPrint(),
    format.label({ label: '[PLCO-SERVER]' }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    //
    // The simple format outputs
    // `${level}: ${message} ${[Object with everything else]}`
    //
    // format.simple(),
    //
    // Alternatively you could use this custom printf format if you
    // want to control where the timestamp comes in your final message.
    // Try replacing `format.simple()` above with this:
    //
    format.printf(info => {
      if (info.level === 'error') {
        return `[${info.timestamp}] [${info.level}] ${info.stack}`;
      } else {
        return `[${info.timestamp}] [${info.level}] ${info.message}`;
      }
    })
  ),
  transports: [
    new (transports.DailyRotateFile)({
      filename: logpath + 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: false,
      maxSize: '1024m',
      timestamp: true,
      maxFiles: '1d',
      prepend: true
    }),
    new transports.Console()
  ],
  exitOnError: false
});

module.exports = logger;