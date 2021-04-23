const config = require("../config.json");
const { asAttachment } = require("./response");
const { logResponse, useBrowserOnly } = require("./hooks");
const {
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
  setShareLink,
  getPrincipalComponentAnalysis,
  ping,
} = require("./query");

async function webApiRoutes(app, options) {
  const context = {
    connection: app.mysql[config.database.name],
    logger: app.log,
  };

  // log response status code, time, path, and query params
  app.addHook("onResponse", logResponse);

  // suggest public api for non-browser users
  app.addHook("onRequest", useBrowserOnly({
    message: 'Please use the PLCO Atlas Public API to perform queries outside the browser.'
  }));

  // returns "true" if service is up
  app.get("/ping", async () => ping(context));

  // retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
  app.get("/summary", async ({ query }) => getSummary(context, query));

  // retrieves all variants filtered by the specified params
  app.get("/variants", async ({ query }) => getVariants(context, query));

  // exports /variants as a csv
  app.get("/export-variants", async ({ query }, response) =>
    asAttachment({ response, ...(await exportVariants(context, query)) })
  );

  //retrieves a subset of variants
  app.get("/points", async ({ query }) => getPoints(context, query));

  // retrieves metadata
  app.get("/metadata", async ({ query }) => getMetadata(context, query));

  // retrieves genes
  app.get("/genes", async ({ query }, res) => getGenes(context, query));

  // retrieves phenotypes
  app.get("/phenotypes", async ({ query }) => getPhenotypes(context, query));

  // retrieves a single phenotype's participant data
  app.get("/phenotype", async ({ query }) => getPhenotype(context, query));

  // retrieves correlations
  app.get("/correlations", async ({ query }) =>
    getCorrelations(context, query)
  );

  // retrieves pca (using pc_x and pc_y)
  app.get("/pca", async ({ query }) =>
    getPrincipalComponentAnalysis(context, query)
  );

  // retrieves chromosome ranges
  app.get("/ranges", async _ => getRanges(context));

  // sets and retrieves share link parameters
  app.get("/share-link", async ({ query }) => getShareLink(context, query));
  app.post("/share-link", async ({ body }) => setShareLink(context, body));

  // retrieves public configuration
  app.get("/config", async ({ query }) => getConfig(query.key));
}

async function publicApiRoutes(app, options) {
  const context = {
    connection: app.mysql[config.database.name],
    logger: app.log,
  };

  // add cors headers to public api routes
  app.use(require('fastify-cors'));

  // log response status code, time, path, and query params
  app.addHook("onResponse", logResponse);

  // returns "true" if service is up
  app.get("/api/ping", async (req, res) => ping(context));

  // retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
  app.get("/api/summary", async ({ query }) => getSummary(context, query));

  // retrieves all variants filtered by the specified params
  app.get("/api/variants", async ({ query }) => getVariants(context, query));

  // exports /variants as a csv
  app.get("/api/export-variants", async ({ query }, response) =>
    asAttachment({ response, ...(await exportVariants(context, query)) })
  );

  //retrieves a subset of variants
  app.get("/api/points", async ({ query }) => getPoints(context, query));

  // retrieves metadata
  app.get("/api/metadata", async ({ query }) => getMetadata(context, query));

  // retrieves phenotypes
  app.get("/api/phenotypes", async ({ query }) =>
    getPhenotypes(context, query)
  );

  // retrieves a single phenotype's participant data
  app.get("/api/phenotype", async ({ query }) => getPhenotype(context, query));

  // retrieves correlations
  app.get("/api/correlations", async ({ query }) =>
    getCorrelations(context, query)
  );

  // retrieves pca (using pc_x and pc_y)
  app.get("/api/pca", async ({ query }) =>
    getPrincipalComponentAnalysis(context, query)
  );
}

module.exports = {
  webApiRoutes,
  publicApiRoutes,
};
