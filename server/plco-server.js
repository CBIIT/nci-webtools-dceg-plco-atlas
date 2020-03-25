const path = require("path");
const server = require("fastify");
const cors = require("fastify-cors");
const compress = require("fastify-compress");
const static = require("fastify-static");
const logger = require("./logger");
const { port, dbpath } = require("./config.json");
const {
  connection,
  getSummary,
  getVariants,
  getMetadata,
  getGenes,
  getCorrelations,
  getPhenotype,
  getPhenotypes,
  getRanges,
  getCounts,
  getConfig
} = require("./query");

logger.info(`[${process.pid}] Started process`);

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
  let pathname = req.raw.url.replace(/\?.*$/, "");
  res.header("Timestamp", new Date().getTime());
  logger.info(`[${process.pid}] ${pathname}: Started Request`, req.query);
  done();
});

// execute before sending response
app.addHook("onSend", (req, res, payload, done) => {

  let pathname = req.raw.url.replace(/\?.*$/, "");
  let timestamp = res.getHeader("Timestamp");

  // log response time and parameters for the specified routes
  const loggedRoutes = /summary|variants|metadata|genes|correlations|config|phenotype/;
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
    await connection.ping()
    return true;
  } catch (error) {
    logger.error(`[${process.pid}] ${ERROR}: ${error}`, req.query);
    throw(error);
  }
});

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
  return getMetadata(connection, query);
});

// retrieves genes
app.get("/genes", async ({ query }, res) => {
  return getGenes(connection, query);
});

// retrieves phenotypes
app.get("/phenotypes", async ({ query }, res) => {
  return getPhenotypes(connection, query);
});

// retrieves phenotypes
app.get("/phenotype", async ({ query }, res) => {
  return getPhenotype(connection, query);
});

// retrieves correlations
app.get("/correlations", async ({ query }, res) => {
  return getCorrelations(connection, query);
});

// retrieves chromosome ranges
app.get("/ranges", async ({ query }, res) => {
  return getRanges(connection);
});

// retrieves variant counts
app.get("/counts", async ({ query }, res) => {
  return getCounts(connection, query);
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
