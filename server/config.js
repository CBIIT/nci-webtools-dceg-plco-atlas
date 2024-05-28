//enviroment variables loadded here are avaible through process.env in the build
const config = {
  port: process.env.PORT,
  exportRowLimit: process.env.EXPORT_ROW_LIMIT,
  downloadRoot: process.env.DOWNLOADROOT,
  database: {
    name: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    user: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
  },
};
module.exports = config;
