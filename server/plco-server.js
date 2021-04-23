const path = require("path");
const fastify = require("fastify");
const forkCluster = require("./services/cluster");
const getLogger = require("./services/logger");
const api = require("./services/api");
const config = require("./config.json");
const isProduction = process.env.NODE_ENV === "production";

// fork and return if in master process
if (isProduction && forkCluster()) return;

// create fastify app
const app = fastify({
  ignoreTrailingSlash: true,
  bodyLimit: 10 * 1024 * 1024, // 10mb
  caseSensitive: false,
  trustProxy: true,
  logger: getLogger("plcogwas"),
  disableRequestLogging: true,
});

// compress all responses
app.register(require("fastify-compress"));

// set 20 minute response timeout
app.register(require("fastify-server-timeout"), {
  serverTimeout: 1000 * 60 * 20,
});

// serve static files
app.register(require("fastify-static"), {
  root: path.resolve(config.static || "www"),
});

// register mysql connection pool
app.register(require("fastify-mysql"), {
  ...config.database,
  database: config.database.name,
  promise: true,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  multipleStatements: true,
});

// register redis cache if available
if (config.redis) {
  app.register(require("fastify-redis"), config.redis);
}

// serve website api
app.register(api.webApiRoutes);

// serve public api
app.register(api.publicApiRoutes);

// listen on specified port
app.listen(config.port, "0.0.0.0").catch(error => {
  app.log.error(error);
  process.exit(1);
});
