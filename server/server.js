const path = require('path');
const { databases, port } = require('./config.json');
const { getRanges, getSummary, getVariants, getVariant, getQQImageMapJSON } = require('./query');

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
app.get('/ranges', async ({query}, res) => {
    const db = databases.find(e => e.name === query.database);
    res.header('Cache-Control', 'max-age=300');
    return getRanges(db.filepath);
});

// retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
app.get('/summary', async ({query}, res) => {
    const db = databases.find(e => e.name === query.database);
    res.header('Cache-Control', 'max-age=300');
    return getSummary(db.filepath, query);
});

// retrieves all variants within the specified range
app.get('/variants', async ({query}, res) => {
    const db = databases.find(e => e.name === query.database);
    res.header('Cache-Control', 'max-age=300');
    return getVariants(db.filepath, query);
});

// retrieves single variant details given the snp or chr:pos
app.get('/variant', async ({query}, res) => {
    // console.log("query", query);
    const db = databases.find(e => e.name === query.database);
    res.header('Cache-Control', 'max-age=300');
    return getVariant(db.filepath, query);
});

// retrieves all variants within the specified range for QQ plot, sorted by p-values descending
app.get('/imagemapqq', async ({query}, res) => {
    res.header('Cache-Control', 'max-age=300');
    return getQQImageMapJSON(query.database);
});

app.listen(port, '0.0.0.0')
    .then(addr => console.log(`Application is running on: ${addr}`))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
