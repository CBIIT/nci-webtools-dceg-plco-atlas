const mysql = require('mysql2/promise');
const redis = require('ioredis');
const { request, asQueryString, deferUntilResolved } = require('./utils');
const config = require('../server/config');

async function main() {

  // flush redis cache
  if (config.redis) {
    const redisClient = new redis(config.redis);
    await redisClient.flushall();
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

    const [metadataRecords] = await connection.query(`SELECT phenotype_id, sex, ancestry FROM phenotype_metadata WHERE chromosome = 'all' AND COUNT > 0`);

    const status = await deferUntilResolved(async () => {
      const pingUrl = `http://localhost:${config.port}/api/ping`;
      return await request(pingUrl);
    });

    if (!status) {
      throw new Error("API is not running")
    }

    for (const record of metadataRecords) {
      const summaryQueryParams = asQueryString({
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
      const summaryQueryUrl = `http://localhost:${config.port}/api/summary?${summaryQueryParams}`;
      console.log(summaryQueryUrl);
      await request(summaryQueryUrl);

      // populate /points cache
      const pointsQueryUrl = `http://localhost:${config.port}/api/points?${pointsQueryParams}`;
      console.log(pointsQueryUrl);
      await request(pointsQueryUrl);
    }
  }

  return true;
}

main().then(success => {
  console.log('reinitialized cache')
  process.exit(0);
}).catch(error => {
  console.log(error);
  process.exit(1);
});