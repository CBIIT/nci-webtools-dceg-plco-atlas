require("dotenv").config();
const cors = require("fastify-cors");
const caching = require("fastify-caching");
const config = require("../config.js");
const { asAttachment } = require("./response");
const {
  useResponseLogger,
  useBrowserOnly,
  useGetRedisKey,
  useSetRedisKey,
} = require("./hooks");
const {
  getSummary,
  getVariants,
  exportVariants,
  getPoints,
  getMetadata,
  getGenes,
  getCorrelations,
  getPhenotypeParticipants,
  getPhenotypes,
  getRanges,
  getConfig,
  getDownloadLink,
  getShareLink,
  setShareLink,
  getParticipants,
  getPrincipalComponentAnalysis,
  ping,
} = require("./query");

async function webApiRoutes(fastify, options) {
  const context = {
    connection: fastify.mysql,
    logger: fastify.log,
    redis: fastify.redis,
  };

  // set cache headers
  fastify.register(caching, {
    privacy: caching.privacy.PUBLIC,
    expiresIn: 60 * 60,
  });

  // log response status code, time, path, and query params
  fastify.addHook("onResponse", useResponseLogger);

  // suggest public api for non-browser users
  fastify.addHook(
    "onRequest",
    useBrowserOnly({
      message:
        "Please use the GWAS Explorer Public API to perform queries outside the browser.",
    })
  );

  if (context.redis) {
    // retrieve variants from redis if they exist
    fastify.addHook(
      "onRequest",
      useGetRedisKey({
        redis: context.redis,
        match: (req) => /variants|summary|points/.test(req.url),
      })
    );

    // save variants to redis if the response size is large
    fastify.addHook(
      "preSerialization",
      useSetRedisKey({
        redis: context.redis,
        match: (req, res, payload) =>
          /variants|summary|points/.test(req.url) &&
          payload &&
          payload.data.length > 1e3,
      })
    );
  }

  // returns "true" if service is up
  fastify.get("/ping", async () => ping(context));

  // retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
  fastify.get("/summary", async ({ query }) => getSummary(context, query));

  // retrieves all variants filtered by the specified params
  fastify.get("/variants", async ({ query }) => getVariants(context, query));

  // exports /variants as a csv
  fastify.get("/export-variants", async ({ query }, response) =>
    asAttachment({ response, ...(await exportVariants(context, query)) })
  );

  //retrieves a subset of variants
  fastify.get("/points", async ({ query }) => getPoints(context, query));

  // retrieves metadata
  fastify.get("/metadata", async ({ query }) => getMetadata(context, query));

  // retrieves genes
  fastify.get("/genes", async ({ query }, res) => getGenes(context, query));

  // retrieves phenotypes
  fastify.get("/phenotypes", async ({ query }) =>
    getPhenotypes(context, query)
  );

  // retrieves a single phenotype's participant data
  fastify.get("/participants", async ({ query }) =>
    getPhenotypeParticipants(context, query)
  );

  // retrieves correlations
  fastify.get("/correlations", async ({ query }) =>
    getCorrelations(context, query)
  );

  // retrieves pca (using pc_x and pc_y)
  fastify.get("/pca", async ({ query }) =>
    getPrincipalComponentAnalysis(context, query)
  );

  // retrieves chromosome ranges
  fastify.get("/ranges", async (_) => getRanges(context));

  // redirects to the specified download phenotype's download link
  fastify.get("/download", ({ query }, reply) =>
    getDownloadLink(context, query).then((link) => {
      query.get_link_only === "true" ? reply.send(link) : reply.redirect(link);
    })
  );

  // sets and retrieves share link parameters
  fastify.get("/share-link", async ({ query }) => getShareLink(context, query));

  fastify.post("/share-link", async ({ body }) => setShareLink(context, body));

  // retrieves public configuration
  fastify.get("/config", async ({ query }) => getConfig(query.key));
}

async function publicApiRoutes(fastify, options) {
  const context = {
    connection: fastify.mysql,
    logger: fastify.log,
    redis: fastify.redis,
  };

  // add cors headers to public api routes
  fastify.register(cors);

  // set cache headers
  fastify.register(caching, {
    privacy: caching.privacy.PUBLIC,
    expiresIn: 60 * 60,
  });

  // log response status code, time, path, and query params
  fastify.addHook("onResponse", useResponseLogger);

  if (context.redis) {
    // retrieve variants from redis if they exist
    fastify.addHook(
      "onRequest",
      useGetRedisKey({
        redis: context.redis,
        match: (req) => /variants|summary|participants|points/.test(req.url),
      })
    );

    // save variants to redis if the response size is large
    fastify.addHook(
      "preSerialization",
      useSetRedisKey({
        redis: context.redis,
        match: (req, res, payload) =>
          /variants|summary|participants|points/.test(req.url) &&
          payload &&
          payload.data.length > 1e3,
      })
    );
  }

  // returns "true" if service is up
  fastify.get("/api/ping", async (req, res) => ping(context));

  // retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
  fastify.get("/api/summary", async ({ query }) => getSummary(context, query));

  // retrieves all variants filtered by the specified params
  fastify.get("/api/variants", async ({ query }) =>
    getVariants(context, query)
  );

  // exports /variants as a csv
  fastify.get("/api/export-variants", async ({ query }, response) =>
    asAttachment({ response, ...(await exportVariants(context, query)) })
  );

  //retrieves a subset of variants
  fastify.get("/api/points", async ({ query }) => getPoints(context, query));

  // retrieves metadata
  fastify.get("/api/metadata", async ({ query }) =>
    getMetadata(context, query)
  );

  // retrieves phenotypes
  fastify.get("/api/phenotypes", async ({ query }) =>
    getPhenotypes(context, query)
  );

  // retrieves a single phenotype's participant data
  fastify.get("/api/participants", async ({ query }) =>
    getParticipants(context, query)
  );

  // retrieves correlations
  fastify.get("/api/correlations", async ({ query }) =>
    getCorrelations(context, query)
  );

  // retrieves pca (using pc_x and pc_y)
  fastify.get("/api/pca", async ({ query }) =>
    getPrincipalComponentAnalysis(context, query)
  );

  // redirects to the specified download phenotype's download link
  fastify.get("/api/download", ({ query }, reply) =>
    getDownloadLink(context, query).then((link) => {
      query.get_link_only === "true" ? reply.send(link) : reply.redirect(link);
    })
  );
}

module.exports = {
  webApiRoutes,
  publicApiRoutes,
};
