const cluster = require('cluster');
const path = require('path');
const server = require('fastify');
const cors = require('fastify-cors');
const compress = require('fastify-compress');
const static = require('fastify-static');
const { port, dbpath } = require('./config.json');
const { getSummary, getVariants, getMetadata, getGenes } = require('./query');
const logger = require('./logger');

if (cluster.isMaster) {
    logger.info(`Started master process: ${process.pid}`);
    const numCPUs = require('os').cpus().length;
    for (let i = 0; i < numCPUs; i ++)
        cluster.fork();
    cluster.on('exit',  worker=> {
        logger.info(`Exited worker process: ${worker.process.pid}`);
    });
} else {
    logger.info(`Started worker process: ${process.pid}`);
    const app = server({ignoreTrailingSlash: true});
    app.register(compress);
    app.register(static, {root: path.resolve('www')});
    app.register(static, {root: path.resolve(dbpath), prefix: '/data/', decorateReply: false});
    app.register(cors);
    app.addHook('onRequest', (req, res, done) => {
       let pathname = req.raw.url.replace(/\?.*$/, '');
       if (/summary|variants|metadata|genes/.test(pathname)) {
        res.header('Cache-Control', 'max-age=300');
        logger.info(pathname, req.query);
       }
        done();
    });

    app.get('/ping', (req, res) => res.send(true));

    // retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
    app.get('/summary', async ({query}, res) => {
        return getSummary(dbpath + query.database, query);
    });

    // retrieves all variants within the specified range
    app.get('/variants', async ({query}, res) => {
        return getVariants(dbpath + query.database, query);
    });

    // retrieves metadata
    app.get('/metadata', async ({query}, res) => {
        return getMetadata(dbpath + query.database, query);
    });

    // retrieves genes
    app.get('/genes', async ({query}, res) => {
        return getGenes(dbpath + query.database, query);
    });

    app.listen(port, '0.0.0.0')
        .then(addr => console.log(`Application is running on: ${addr}`))
        .catch(error => {
            logger.error(error);
            process.exit(1);
        });
}
