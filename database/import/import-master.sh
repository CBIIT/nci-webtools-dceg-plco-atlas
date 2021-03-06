#!/bin/sh

# note: do not run this with any other shells (eg: zsh) as they may escape env vars as a single parameter
PLCO_NODE_ARGS="--user $PLCO_MYSQL_USER --password $PLCO_MYSQL_PASSWORD --host $PLCO_MYSQL_HOST --port $PLCO_MYSQL_PORT --db_name $PLCO_MYSQL_DATABASE"
PLCO_MYSQL_ARGS="--user=$PLCO_MYSQL_USER --password=$PLCO_MYSQL_PASSWORD --host=$PLCO_MYSQL_HOST --port=$PLCO_MYSQL_PORT --local-infile=1"
PLCO_DATABASE_OPTIONS="CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci"

echo "Initializing schema and lookup tables"
time mysql $PLCO_MYSQL_ARGS --execute="
    drop database if exists $PLCO_MYSQL_DATABASE;
    create database $PLCO_MYSQL_DATABASE $PLCO_DATABASE_OPTIONS; 
    use $PLCO_MYSQL_DATABASE;
    set FOREIGN_KEY_CHECKS=0;
    source ../schema/tables/main.sql;
    source ../schema/indexes/main.sql;
    source ../schema/procedures/main.sql;
    source import-lookup-tables.sql;
    source import-chromosome-range.sql;
    source import-gene.sql;
"

echo "Importing phenotypes"
time node import-phenotype.js \
    $PLCO_NODE_ARGS \
    --file ../raw/phenotype.csv

echo "Importing phenotype correlations"
time mysql $PLCO_MYSQL_ARGS $PLCO_MYSQL_DATABASE < import-phenotype-correlation.sql

echo "Importing participant data"
time node import-participant-data.js \
    $PLCO_NODE_ARGS \
    --file ../raw/participant_data.tsv \
    --ancestry_file ../raw/participant_ancestry.tsv

echo "Importing participant data categories"
time mysql $PLCO_MYSQL_ARGS $PLCO_MYSQL_DATABASE < import-participant-data-category.sql

echo "Updating participant counts"
time node update-participant-count.js $PLCO_NODE_ARGS

echo "Importing lambdagc LD scores"
time mysql $PLCO_MYSQL_ARGS $PLCO_MYSQL_DATABASE < import-lambda-gc-ld-score.sql

echo "Importing pca data"
time mysql $PLCO_MYSQL_ARGS $PLCO_MYSQL_DATABASE < import-pca.sql

echo "Done, please run parallel-import-combined-variant-mysql.js"