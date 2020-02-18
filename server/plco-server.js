const os = require("os");
const cluster = require("cluster");
const path = require("path");
const server = require("fastify");
const cors = require("fastify-cors");
const compress = require("fastify-compress");
const static = require("fastify-static");
const mysql = require("mysql2");
const { port, database, dbpath } = require("./config.json");
const { connection, getSummary, getVariants, getMetadata, getGenes, getConfig } = require("./query");
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

  // log response time and parameters for the specified routes
  const loggedRoutes = /summary|variants|metadata|genes|correlations|config/;
  if (timestamp && loggedRoutes.test(pathname)) {
    let duration = new Date().getTime() - timestamp;
    logger.info(`[${process.pid}] ${pathname}: ${duration/1000}s`, req.query);

    res.header("Cache-Control", "max-age=300");
    res.header("Response-Time", duration);
  }

  done();
});

app.get("/ping", async (req, res) => {
  try {
//    await connection.ping()
    return true;
  } catch (error) {
    logger.error(`[${process.pid}] ${ERROR}: ${error}`, req.query);
    throw(error);
  }
});

// retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
app.get("/summary", async ({ query }, res) => {
  // todo: validate summary table (query.table)
  return getSummary(connection, query);
});

// retrieves all variants within the specified range
app.get("/variants", async ({ query }, res) => {
  // todo: validate variants table (query.table)
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


// retrieves genes
app.get("/phenotypes", async ({ query }, res) => {
  return getPhenotypes(connection);
});

// retrieves genes
app.get("/correlation", async ({ query }, res) => {
  return getCorrelation(connection, query);
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
