const cluster = require("cluster");
const path = require("path");
const server = require("fastify");
const cors = require("fastify-cors");
const compress = require("fastify-compress");
const static = require("fastify-static");
const { port, dbpath } = require("./config.json");
const { getSummary, getVariants, getMetadata, getGenes, getConfig } = require("./query");
const logger = require("./logger");

if (cluster.isMaster) {
  logger.info(`[${process.pid}] Started master process`);
  const numProcesses = require("os").cpus().length * 2; // two processes per cpu
  for (let i = 0; i < numProcesses; i++) cluster.fork();
  cluster.on("exit", worker => {
    logger.info(`Restarted worker process: ${worker.process.pid}`);
    cluster.fork();
  });
  return;
}

logger.info(`[${process.pid}] Started worker process`);

const app = server({ ignoreTrailingSlash: true });
app.register(compress);
app.register(static, { root: path.resolve("www") });
app.register(static, {
  root: path.resolve(dbpath),
  prefix: "/data/",
  decorateReply: false
});
app.register(cors);


// execute code before handling request
app.addHook("onRequest", (req, res, done) => {
  res.header("Timestamp", new Date().getTime());
  done();
});

// execute code before sending response
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
  return getSummary(dbpath + query.database, query);
});

// retrieves all variants within the specified range
app.get("/variants", async ({ query }, res) => {
  return getVariants(dbpath + query.database, query);
});

// retrieves metadata
app.get("/metadata", async ({ query }, res) => {
  return getMetadata(dbpath + query.database, query.key);
});

// retrieves genes
app.get("/genes", async ({ query }, res) => {
  return getGenes(dbpath + query.database, query);
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
