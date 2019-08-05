const path = require('path');
const { databases, port } = require('./config.json');
const { getRanges, getSummary, getVariants, getQQImageMapJSON } = require('./query');

const app = require('fastify')({
    ignoreTrailingSlash: true,
});
app.register(require('fastify-cors'));
app.register(require('fastify-static'), {
    // root: path.resolve('client', 'build')
    root: path.resolve('www')
});

// todo: check connectivity to database
app.get('/ping', (req, res) => res.send(true));

// retrieves metadata for a particular database (BP/P ranges, # variants, etc)
app.get('/ranges', ({query}, res) => {
    try {
        const db = databases.find(e => e.name === query.database);
        res.header('Cache-Control', 'max-age=300');
        res.send(getRanges(db.filepath));
    } catch (e) {
        res.send(e);
    }
});

// retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
app.get('/summary', ({query}, res) => {
    try {
        const db = databases.find(e => e.name === query.database);
        res.header('Cache-Control', 'max-age=300');
        res.send(getSummary(db.filepath, query));
    } catch (e) {
        res.send(e);
    }
});

// retrieves all variants within the specified range
app.get('/variants', ({query}, res) => {
    try {
        const db = databases.find(e => e.name === query.database);
        res.header('Cache-Control', 'max-age=300');
        res.send(getVariants(db.filepath, query));
    } catch (e) {
        res.send(e);
    }
});

// retrieves all variants within the specified range for QQ plot, sorted by p-values descending
app.get('/imagemapqq', ({query}, res) => {
    res.header('Cache-Control', 'max-age=300');
    res.send(getQQImageMapJSON(query.database));
});

app.listen(port, '0.0.0.0')
    .then(addr => console.log(`Application is running on: ${addr}`))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
