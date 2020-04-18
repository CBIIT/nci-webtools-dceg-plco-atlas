const path = require("path");
const server = require("fastify");
const cors = require("fastify-cors");
const compress = require("fastify-compress");
const static = require("fastify-static");
const logger = require("./logger");
const { port } = require("./config.json");
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
  getConfig,
  getShareLink,
  setShareLink
} = require("./query");

logger.info(`[${process.pid}] Started process`);

// create fastify app and register middleware
const app = server({ ignoreTrailingSlash: true });
app.register(compress);
app.register(cors);
app.register(static, {
  root: path.resolve("www")
});

app.addHook('onError', async (req, reply, error) => {
  const statusCode = error.statusCode;
  const isClientError = statusCode >= 400 && statusCode < 500;
  logger[isClientError ? 'info' : 'error'](
    `[${process.pid}] `, new Error(error), req.query
  );
  reply.status(500);
  reply.send();
});

// execute before handling request
app.addHook("onRequest", (req, res, done) => {
  let pathname = req.raw.url.replace(/\?.*$/, "");
  res.header("Timestamp", new Date().getTime());
  logger.info(`[${process.pid}] ${pathname}: Started Request`, req.query);
  logger.debug(`[${process.pid}] ${pathname} ${JSON.stringify(req.query, null, 2)}`);
  done();
});

// execute before sending response
app.addHook("onSend", (req, res, payload, done) => {

  let pathname = req.raw.url.replace(/\?.*$/, "");
  let timestamp = res.getHeader("Timestamp");

  // log response time and parameters for the specified routes
  
  const loggedRoutes = [
    '/favicon.ico',
    '/ping',
    '/summary',
    '/variants',
    '/metadata',
    '/genes',
    '/phenotypes',
    '/correlations',
    '/config',
    '/phenotype',
    '/ranges',
    '/share-link'
  ];
  if (timestamp && loggedRoutes.includes(pathname)) {
    let duration = new Date().getTime() - timestamp;
    logger.info(`[${process.pid}] ${pathname}: ${duration/1000}s`, req.query);

    res.header("Cache-Control", "max-age=300");
    res.header("Response-Time", duration);
  } else {
    logger.info(`[${process.pid}] Route ${pathname} not logged`, req.query)
  }

  done();
});

app.get("/ping", async (req, res) => {
  let sql = `SELECT "true" as status`;
  logger.debug(`ping sql: ${sql}`);
  const [result] = await connection.query(sql);
  return result[0].status;
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

app.get("/share-link", async ({ query }, res) => {
  return getShareLink(connection, query);
});

app.post("/share-link", async ({ body }, res) => {
  return setShareLink(connection, body);
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
    logger.error(`[${process.pid}] `, new Error(error));
    process.exit(1);
  });
