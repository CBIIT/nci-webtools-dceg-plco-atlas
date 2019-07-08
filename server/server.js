const express = require('express');
const cors = require('cors');
const { databases, port } = require('./config.json');
const { getRanges, getSummary, getVariants } = require('./query');
const app = express();

// serve static files from the client/build folder
app.use(express.static('client/build'));

// add cors headers to the response (allow cross-origin requests)
app.use(cors());

// todo: check connectivity to database
app.get('/ping', (req, res) => res.json(true));

// retrieves metadata for a particular database (BP/P ranges, # variants, etc)
app.get('/ranges', async ({query}, res) => {
    const db = databases.find(e => e.name === query.database);
    res.json(await getRanges(db.filepath));
});

// retrieves all variant groups for all chroms. at the lowest granularity (in MBases)
app.get('/summary', async ({query}, res) => {
    const db = databases.find(e => e.name === query.database);
    res.json(await getSummary(db.filepath));
});

// retrieves all variants at the specified granularity (using 1000 kb, 100 kb, or individual)
app.get('/variants', async ({query}, res) => {
    const db = databases.find(e => e.name === query.database);
    res.json(await getVariants(db.filepath, query));
});

app.listen(port, _ => console.log(`Application is running on port: ${port}`));