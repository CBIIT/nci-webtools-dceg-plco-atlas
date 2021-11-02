const mysql = require('mysql2/promise');
const redis = require('ioredis');
const { request, asQueryString } = require('./utils');
const config = require('../server/config');
(async function main() {

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
    console.log(metadataRecords);
  }
})();