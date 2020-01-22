const os = require("os");
const cluster = require("cluster");
const path = require("path");
const server = require("fastify");
const cors = require("fastify-cors");
const compress = require("fastify-compress");
const static = require("fastify-static");
const mysql = require("mysql2");
const { port, database } = require("./config.json");
const { getSummary, getVariants, getMetadata, getGenes, getConfig } = require("./query");
const logger = require("./logger");

if (cluster.isMaster) {
  logger.info(`[${process.pid}] Started master process`);

  // create two worker processes per cpu
  for (let i = 0; i < 2 * os.cpus(); i++) {
    cluster.fork();
  }

  // restart worker processes if they exit unexpectedly
  cluster.on("exit", worker => {
    logger.info(`Restarted worker process: ${worker.process.pid}`);
    cluster.fork();
  });

  // finish execution if in master process
  return;
}

logger.info(`[${process.pid}] Started worker process`);

// create connection pool for worker processes
const connection = mysql.createPool({
  host: database.host,
  database: database.name,
  user: database.user,
  password: database.user,
  waitForConnections: true,
  connectionLimit: 20,
  namedPlaceholders: true
}).promise();

// create fastify app and register middleware
const app = server({ ignoreTrailingSlash: true });
app.register(compress);
app.register(cors);
app.register(static, {
  root: path.resolve("www")
});

// todo: replace .json files with api routes (if needed)
app.register(static, {
  root: path.resolve(dbpath),
  prefix: "/data/",
  decorateReply: false
});

// execute before handling request
app.addHook("onRequest", (req, res, done) => {
  res.header("Timestamp", new Date().getTime());
  done();
});

// execute before sending response
app.addHook("onSend", (req, res, payload, done) => {

  let pathname = req.raw.url.replace(/\?.*$/, "");
  let timestamp = res.getHeader("Timestamp");

  if (timestamp && /summary|variants|metadata|genes|config/.test(pathname)) {
    let duration = new Date().getTime() - timestamp;
    logger.info(`[${process.pid}] ${pathname}: ${duration/1000}s`, req.query);

    res.header("Cache-Control", "max-age=300");
    res.header("Response-Time", duration);
  }

  done();
});

app.get("/ping", (req, res) => res.send(true));

// retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
app.get("/summary", async ({ query }, res) => {
  return getSummary(connection, query);
});

// retrieves all variants within the specified range
app.get("/variants", async ({ query }, res) => {
  return getVariants(connection, query);
});

// retrieves metadata
app.get("/metadata", async ({ query }, res) => {
  return getMetadata(connection, query.key);
});

// retrieves genes
app.get("/genes", async ({ query }, res) => {
  return getGenes(connection, query);
});

// retrieves configuration
app.get("/config", async ({ query }, res) => {
  return getConfig(query.key);
});

app
  .listen(port, "0.0.0.0")
  .then(addr =>
    logger.info(`[${process.pid}] Application is running on: ${addr}`)
  )
  .catch(error => {
    logger.error(error);
    process.exit(1);
  });
