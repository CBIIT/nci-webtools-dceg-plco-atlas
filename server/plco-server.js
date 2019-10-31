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
        logger.info(`Exited worker process: ${workder.process.pid}`);
    });
} else {
    const app = server({ignoreTrailingSlash: true});
    app.register(compress);
    app.register(static, {root: path.resolve('www')});
    app.register(static, {root: path.resolve(dbpath), prefix: '/data/', decorateReply: false});
    app.register(cors);
    logger.info(`Started worker process: ${process.pid}`);

    // todo: check connectivity to database
    app.get('/ping', (req, res) => res.send(true));

    // retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
    app.get('/summary', async ({query}, res) => {
        logger.info("Execute summary query.");
        logger.info("Query:", query);
        res.header('Cache-Control', 'max-age=300');
        return getSummary(dbpath + query.database, query);
    });

    // retrieves all variants within the specified range
    app.get('/variants', async ({query}, res) => {
        logger.info("Execute variants query.");
        logger.info("Query:", query);
        res.header('Cache-Control', 'max-age=300');
        return getVariants(dbpath + query.database, query);
    });

    // retrieves metadata
    app.get('/metadata', async ({query}, res) => {
        logger.info("Execute metadata query.");
        logger.info("Query:", query);
        res.header('Cache-Control', 'max-age=300');
        return getMetadata(dbpath + query.database);
    });

    // retrieves genes
    app.get('/genes', async ({query}, res) => {
        logger.info("Execute genes query.");
        logger.info("Query:", query);
        res.header('Cache-Control', 'max-age=300');
        return getGenes(dbpath + query.database, query);
    });

    app.listen(port, '0.0.0.0')
        .then(addr => console.log(`Application is running on: ${addr}`))
        .catch(error => {
            logger.info("Error:", error);
            console.error(error);
            process.exit(1);
        });
}
