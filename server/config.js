//enviroment variables loadded here are avaible through process.env in the build
const config = {
  port: process.env.PORT,
  logpath: process.env.logpath,
  loglevel: process.env.loglevel,
  exportRowLimit: process.env.exportRowLimit,
  downloadRoot: process.env.downloadRoot,
  database: {
    name: process.env.database_name,
    host: process.env.database_host,
    port: process.env.database_port,
    user: process.env.database_user,
    password: process.env.database_password,
  },
  _redis: {
    host: process.env._redis_host,
    port: process.env._redis_port,
    user: process.env._redis_user,
    password: process.env._redis_password,
  },
};
module.exports = config;
