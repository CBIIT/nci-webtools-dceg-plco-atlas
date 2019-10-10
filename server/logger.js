/**
 * Log output from Express JS and R Wrapper
 */

'use strict';

const winston = require('winston');
const { logpath } = require('./config.json');
require('winston-daily-rotate-file');
// winston.emitErrs = true;

var logger = new winston.createLogger({
  transports: [
    new (winston.transports.DailyRotateFile)({
          filename: logpath + 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: false,
          maxSize: '1024m',
          timestamp: true,
          maxFiles: '1d',
          prepend: true
        }),
      new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          json: false,
          colorize: true
      })
  ],
  exitOnError: false
});

module.exports = logger;