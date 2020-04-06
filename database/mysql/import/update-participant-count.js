const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
const { database } = require('../../../server/config.json');
const { timestamp } = require('./utils/logging');
const { getRecords, pluck } = require('./utils/query');

// set defaults
//const errorLog = getLogStream(`./failed-variants-${new Date().toISOString()}.txt`);
const errorLog = {write: e => console.log(e)};
const duration = timestamp();
const connection = mysql.createConnection({
    host: database.host,
    database: database.name,
    user: database.user,
    password: database.password,
    namedPlaceholders: true,
    multipleStatements: true,
    // debug: true,
  }).promise();

updateCounts().then(e => {
    console.log(`[${duration()} s] Updated participant counts`);
    process.exit(0);
});

function findChildren(node, children = []) {
    (node.children || []).forEach(child => {
        children.push(child);
        findChildren(child, children);
    });
    return children;
}

// for each phenotype, query all child phenotypes to get distinct participant counts
// if a child phenotype is binary, then include participants whose values for that phenotype are 1
// otherwise, include participants whose values are not null
async function insertParticipantIds(tableName, phenotypeId, type) {
    if (!/^(binary|categorical|continuous)$/.test(type)) return;
    return await connection.query(`
        insert into ${tableName}
        select participant_id from participant_data pd
        where phenotype_id = :id and
        ${type === 'binary' ? `value = 1` : `value IS NOT NULL`};
    `, {id: phenotypeId});
}

async function updateCounts() {
    await connection.query(`
        START TRANSACTION;
        SET autocommit = 0;
    `);

    // populate phenotype children
    let [phenotypes] = await connection.query(`SELECT * FROM phenotype`);
    phenotypes.forEach(phenotype => {
        let parent = phenotypes.find(parent => parent.id === phenotype.parent_id);
        if (parent) parent.children = [...parent.children || [], phenotype];
    });

    for (let p of phenotypes) {
        console.log(`[${duration()} s] ${p.name} (${p.display_name}): Counting child node(s)`);

        let tableName = `participant_id`;
        await connection.query(`
            DROP TEMPORARY TABLE IF EXISTS ${tableName};
            CREATE TEMPORARY TABLE ${tableName} (id BIGINT);
        `);

        // if the current phenotype has a type, then its participants should be included
        await insertParticipantIds(tableName, p.id, p.type)

        // find all children of the current phenotype which have a defined type
        let children = findChildren(p).filter(c => c.type);

        // populate participant_id with each child's distinct participants
        for (let child of children) {
            console.log(`[${duration()} s] ${p.name} (${p.display_name}): Determining participant(s) for ${child.name}`);
            await insertParticipantIds(tableName, child.id, child.type);
        }

        // determine distinct participants
        let [countRows] = await connection.query(`SELECT COUNT(DISTINCT id) AS count FROM ${tableName}`);
        let count = countRows[0].count;
        console.log(`[${duration()} s] ${p.name} (${p.display_name}): ${count} participant(s)`);

        // insert count into phenotype table
        await connection.execute(
            `UPDATE phenotype
            SET participant_count = :count
            WHERE id = :id`,
            {id: p.id, count}
        );

        // drop temporary table
        await connection.query(`DROP TEMPORARY TABLE ${tableName}`);
    }

    await connection.query(`COMMIT`);
    await connection.end();
    return 0;
}
