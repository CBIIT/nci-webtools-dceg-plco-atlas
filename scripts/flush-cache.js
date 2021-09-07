const mysql = require('mysql2/promise');
const redis = require('ioredis');
const { request, asQueryString } = require('./utils');
const config = require('../server/config');
(async function main() {

  // flush redis cache
  if (config.redis) {
    const redisClient = new redis(config.redis);
    redisClient.flushall();
  }

  // populate cache with new defaults
  if (config.database) {
    const connection = await mysql.createConnection({
      database: config.database.name,
      user: config.database.user,
      host: config.database.host,
      port: config.database.port,
      password: config.database.password
    });

    const phenotypes = await connection.query(`SELECT distinct phenotype_id FROM phenotype_metadata WHERE COUNT > 0`);
    const metadataRecords = await connection.query(`SELECT phenotype_id, sex, ancestry FROM phenotype_metadata WHERE chromosome = 'all' AND COUNT > 0`);

    for (const record of metadataRecords) {
      const summaryQueryParams = asQueryString({
        phenotypes: [record],
        stratifications: [record] ,
        p_value_nlog_min: 2,
        phenotype_id: record.phenotype_id,
        sex: record.sex,
        ancestry: record.ancestry,
        raw: true,
      });
      const pointsQueryParams = asQueryString({
        phenotype_id: record.phenotype_id,
        sex: record.sex,
        ancestry: record.ancestry,
        raw: true,
      });

      // populate /summary cache
      const summaryQueryUrl = `http://localhost:${config.port}/summary?${summaryQueryParams}`;\
      console.log(summaryQueryUrl);
      await request(summaryQueryUrl);

      // populate /points cache
      const pointsQueryUrl = `http://localhost:${config.port}/points?${pointsQueryParams}`;
      console.log(pointsQueryUrl);
      await request(pointsQueryUrl);
    }
  }
})();