const cluster = require('cluster');
const path = require("path");
const server = require("fastify");
const cors = require("fastify-cors");
const compress = require("fastify-compress");
const static = require("fastify-static");
const serverTimeout = require('fastify-server-timeout');
const { UAParser } = require('ua-parser-js');
const redis = require('redis');
const logger = require("./logger");
const config = require("./config.json");
const args = require('minimist')(process.argv.slice(2));
const numCPUs = require('os').cpus().length;

const {
  getConnection,
  getSummary,
  getVariants,
  exportVariants,
  getPoints,
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

if (cluster.isMaster) {
  logger.info(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    // restart workers that die
    logger.info(`worker ${worker.process.pid} died`);
    cluster.fork();    
  });
  return;
}

logger.info(`[${process.pid}] Started worker process`);

// create fastify app and register middleware
const app = server({ ignoreTrailingSlash: true });
const connection = getConnection();
app.register(compress);
app.register(cors);
app.register(serverTimeout, {serverTimeout: 1000 * 60 * 20}); // 20 min timeout
app.register(static, {
  root: path.resolve("www")
});

const redisClient = config.redis
  ? redis.createClient(config.redis)
  : null;

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
  const browser = new UAParser(req.headers['user-agent']).getBrowser();
  let url = req.raw.url;
  if (!browser.name && !/^\/api\//.test(url)) {
    res.send('Please use the PLCO Atlas Public API to perform queries outside the browser.');
    done();
  }

  let pathname = url.replace(/\?.*$/, "");
  let timestamp = new Date().getTime();
  res.header("Timestamp", timestamp);
  logger.info(`[${process.pid}] ${pathname}: Started Request`, req.query);
  logger.debug(`[${process.pid}] ${pathname} ${JSON.stringify(req.query, null, 2)}`);

  if (redisClient && /variants/.test(url)) {
    redisClient.get(url, function(error, result) {
      if (!error && result !== null) {
        res.send(result);
      } else {
        done();
      }
    });
  } else {
    done();
  }
});

app.addHook('preSerialization', (req, res, payload, done) => {
  let url = req.raw.url;
  if (redisClient && /variants/.test(url) && payload.data.length > 1e4) {
    redisClient.set(url, JSON.stringify(payload)); // asynchronously set data
  }
  done(null, payload)
});

// execute before sending response
app.addHook("onSend", (req, res, payload, done) => {

  let url = req.raw.url;
  let pathname = url.replace(/\?.*$/, "");
  let timestamp = res.getHeader("Timestamp");

  // log response time and parameters for the specified routes
  
  const loggedRoutes = [
    '/favicon.ico',
    '/ping',
    '/summary',
    '/variants',
    '/export-variants',
    '/metadata',
    '/genes',
    '/phenotypes',
    '/correlations',
    '/config',
    '/phenotype',
    '/ranges',
    '/share-link',
    '/api/phenotypes',
    '/api/variants',
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

// retrieves all variants within the specified range
app.get("/export-variants", async ({ query }, res) => {
  const { filename, contents } = await exportVariants(connection, query);
  res.header("Content-Disposition", `attachment; filename="${filename}"`);
  return contents;
});

// note: this is faster than /variants since only a subset of variants are stored as points
app.get("/points", async ({ query }, res) => {
  return getPoints(connection, query);
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

// retrieves phenotypes
app.get("/api/phenotypes", async ({ query }, res) => {
  return getPhenotypes(connection, query);
});

// retrieves all variants within the specified range
app.get("/api/variants", async ({ query }, res) => {
  return getVariants(connection, query);
});

app
  .listen(config.port, "0.0.0.0")
  .then(addr =>
    logger.info(`[${process.pid}] Application is running on: ${addr}`)
  )
  .catch(error => {
    logger.error(`[${process.pid}] `, new Error(error));
    process.exit(1);
  });
