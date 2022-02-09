#!/bin/bash

export DB_USER=$1
export DB_PASS=$2
export BASE_DIR=$3/mysql-instance-base-$SLURM_JOB_ID

# echo "LOADING MODULES (MySQL-8.0.20, NodeJS)..."
# module load mysql/8.0 nodejs
# echo

echo "LOADING MODULES (MySQL-5.7.22, NodeJS)..."
module load mysql/5.7.22 nodejs
echo

echo "CREATING BASE DIR PATH..."
mkdir $BASE_DIR
echo

echo "CREATING LOCAL MYSQL DATABASE INSTANCE IN BASE DIR ..."
time local_mysql --basedir $BASE_DIR create
echo

echo "INJECTING SLURM_JOB_ID ENV VAR TO MYSQL CONFIGURATION FILE..."
envsubst < mysql-basedir.config > my.cnf
echo 

echo "COPYING OVER NEW MYSQL CONFIGURATION FILE..."
rm $BASE_DIR/my.cnf
cp ./my.cnf $BASE_DIR/
echo

echo "STARTING LOCAL MYSQL DATABASE INSTANCE IN BASE DIR..."
time local_mysql --basedir $BASE_DIR start
echo

echo "LOGGING INTO MYSQL AS ROOT AND CREATING $DB_USER USER, CREATING PLCOGWAS DATABASE..."
time mysql -u root -p$DB_PASS --socket=$BASE_DIR/mysql.sock --execute="
    CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS'; 
    GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'localhost' WITH GRANT OPTION; 
    CREATE USER '$DB_USER'@'%' IDENTIFIED BY '$DB_PASS';
    GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'%' WITH GRANT OPTION; 
    CREATE DATABASE plcogwas CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
"
echo

echo "LOGGING INTO MYSQL WITH DB_USER=$DB_USER, DB_PASS=$DB_PASS, HOST=$SLURM_NODELIST, PORT=55555, SETTING MYSQL CONFIGURATIONS..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 plcogwas --execute="
    SELECT @@local_infile; 
    SELECT @@innodb_buffer_pool_size; 
    SELECT @@innodb_read_io_threads; 
    SELECT @@innodb_write_io_threads; 
    SELECT @@innodb_log_buffer_size; 
    SELECT @@innodb_log_file_size; 
    SELECT @@innodb_flush_log_at_trx_commit; 
    SELECT @@innodb_file_per_table; 
    SELECT @@key_buffer_size; 
    SET GLOBAL unique_checks = 0; 
    SET unique_checks = 0; 
    SELECT @@unique_checks;
"
echo

echo "IMPORTING TABLE SCHEMA, INDEXES, AND PROCEDURES..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas --execute="
    set FOREIGN_KEY_CHECKS=0; 
    source ../../schema/tables/main.sql; 
    source ../../schema/indexes/main.sql; 
    source ../../schema/procedures/main.sql;
    source ../import-lookup-tables.sql;
    source ../import-chromosome-range.sql;
    source ../import-gene.sql;
"
echo

# echo "IMPORTING LOOKUP TABLES..."
# time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-lookup-tables.sql
# echo

# echo "IMPORTING CHROMOSOME RANGES..."
# time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-chromosome-range.sql
# echo

# echo "IMPORTING GENES..."
# time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-gene.sql
# echo

echo "IMPORTING PHENOTYPE MAPPINGS..."
time node ../import-phenotype.js --file ../phenotype.csv --host $SLURM_NODELIST --port 55555 --db_name plcogwas --user $DB_USER --password $DB_PASS
echo

echo "IMPORTING PARTICIPANT DATA..."
time node ../import-participant-data.js --file ../raw/participant_data.tsv --ancestry_file ../raw/participant_ancestry.tsv --host $SLURM_NODELIST --port 55555 --db_name plcogwas --user $DB_USER --password $DB_PASS
echo

echo "IMPORTING PARTICIPANT DATA CATEGORIES..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-participant-data-category.sql
echo

# echo "IMPORTING PHENOTYPE CORRELATIONS..."
# time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-phenotype-correlation.sql
# echo

echo "IMPORTING PARTICIPANT COUNTS..."
time node ../update-participant-count.js --host $SLURM_NODELIST --port 55555 --db_name plcogwas --user $DB_USER --password $DB_PASS
echo

# echo "IMPORTING LAMBDA GC LD SCORES..."
# time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-lambda-gc-ld-score.sql
# echo

echo "IMPORTING PC DATA..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-pca.sql
echo

echo "STOPPING MYSQL SERVER..."
local_mysql --basedir $BASE_DIR stop
echo

echo "DONE"
