const path = require('path');
const server = require('fastify');
const cors = require('fastify-cors');
const static = require('fastify-static');
const { port, dbpath } = require('./config.json');
const { getSummary, getVariants, getMetadata } = require('./query');

const app = server({ignoreTrailingSlash: true});
app.register(static, {root: path.resolve('www')});
app.register(static, {root: path.resolve(dbpath), prefix: '/data/', decorateReply: false});
app.register(cors);

// todo: check connectivity to database
app.get('/ping', (req, res) => res.send(true));

// retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
app.get('/summary', async ({query}, res) => {
    res.header('Cache-Control', 'max-age=300');
    return getSummary(dbpath + query.database, query);
});

// retrieves all variants within the specified range
app.get('/variants', async ({query}, res) => {
    res.header('Cache-Control', 'max-age=300');
    return getVariants(dbpath + query.database, query);
});

// retrieves metadata
app.get('/metadata', async ({query}, res) => {
    res.header('Cache-Control', 'max-age=300');
    return getMetadata(dbpath + query.database);
});

app.listen(port, '0.0.0.0')
    .then(addr => console.log(`Application is running on: ${addr}`))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
