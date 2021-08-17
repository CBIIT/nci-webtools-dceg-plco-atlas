const Redis = require('ioredis');
const config = require('../server/config');

if (config.redis) {
  const redis = new Redis(config.redis);
  redis.flushall();
}
