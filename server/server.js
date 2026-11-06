require("dotenv").config();
const path = require("path");
const fastify = require("fastify");
const { LogController } = require("fastify");
const zlib = require("zlib");
const forkCluster = require("./services/cluster");
const getLogger = require("./services/logger");
const api = require("./services/api");
const { deferUntilConnected } = require("./services/query");
const isProduction = process.env.NODE_ENV === "production";
const config = require("./config");
const databaseConfig = {
  database: config.database.name,
  user: config.database.user,
  host: config.database.host,
  port: config.database.port,
  password: config.database.password,
};

// fork and return if in master process
if (isProduction && forkCluster()) return;

(async function main() {
  // create fastify app
  const app = fastify({
    routerOptions: {
      ignoreTrailingSlash: true,
      caseSensitive: false,
    },
    bodyLimit: 10 * 1024 * 1024, // 10mb
    trustProxy: true,
    loggerInstance: getLogger("plcogwas"),
    logController: new LogController({ disableRequestLogging: true }),
  });

  app.log.info("Waiting for mysql connection...");
  await deferUntilConnected(databaseConfig, app.log);
  app.log.info("Connection established");

  // compress all responses (note: keep quality low to decrease ttfb)
  app.register(require("@fastify/compress"), {
    brotliOptions: {
      params: {
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        [zlib.constants.BROTLI_PARAM_QUALITY]: 1,
      },
    },
    zlibOptions: {
      level: 1,
    },
  });

  // set 20 minute response timeout
  app.server.setTimeout(1000 * 60 * 20);

  // serve static files
  app.register(require("@fastify/static"), {
    root: path.resolve(config.static || "www"),
  });

  // register mysql connection pool
  app.register(require("@fastify/mysql"), {
    ...databaseConfig,
    promise: true,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    multipleStatements: true,
    connectTimeout: 1000 * 60 * 10,
  });

  // register redis cache if available
  if (config.redis?.host) {
    app.register(require("@fastify/redis"), config.redis);
  }

  // serve website api
  app.register(api.webApiRoutes);

  // serve public api
  app.register(api.publicApiRoutes);

  // listen on specified port
  app.listen({ port: config.port, host: "0.0.0.0" }).catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
})();
