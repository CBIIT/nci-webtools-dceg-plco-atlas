const express = require('express');
const cors = require('cors');
const query = require('./query');
const config = require('./config.json');
const app = express();

app.use(express.static('client/build'));
app.use(cors());

app.get('/query', async (req, res) => {
    const { database, bpMin, bpMax, pMin, pMax } = req.query;
    const db = config.databases.find(e => e.name === database);
    if (!db) return;

    const results = await query(db.filepath, bpMin, bpMax, pMin, pMax);
    res.json(results);
});

app.listen(config.port || 9000);