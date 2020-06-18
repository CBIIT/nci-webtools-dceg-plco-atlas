#!/bin/bash

export DB_USER=$1
export DB_PASS=$2
export BASE_DIR=/data/$USER/plco/mysql/mysql-instance-base-$SLURM_JOB_ID

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

echo "LOGGING INTO MYSQL AS ROOT AND CREATING $DB_USER USER..."
time mysql -u root -p$DB_PASS --socket=$BASE_DIR/mysql.sock --execute="CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS'; GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'localhost' WITH GRANT OPTION; CREATE USER '$DB_USER'@'%' IDENTIFIED BY '$DB_PASS';GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'%' WITH GRANT OPTION; CREATE DATABASE plcogwas;"
echo

echo "LOGGING INTO MYSQL WITH DB_USER=$DB_USER, DB_PASS=$DB_PASS, HOST=$SLURM_NODELIST, PORT=55555..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 plcogwas --execute="SELECT @@local_infile; SELECT @@innodb_buffer_pool_size; SELECT @@innodb_read_io_threads; SELECT @@innodb_write_io_threads; SELECT @@innodb_log_buffer_size; SELECT @@innodb_log_file_size; SELECT @@innodb_flush_log_at_trx_commit; SELECT @@innodb_file_per_table; SELECT @@key_buffer_size; SET GLOBAL unique_checks = 0; SET unique_checks = 0; SELECT @@unique_checks;"
echo

echo "IMPORTING TABLE SCHEMA, INDEXES, AND PROCEDURES..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 plcogwas --execute="source ../../schema/tables/main.sql; source ../../schema/indexes/main.sql; source ../../schema/procedures/main.sql;"
echo

echo "IMPORTING CHROMOSOME RANGES..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-chromosome-range.sql
echo

echo "IMPORTING GENES..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-gene.sql
echo

echo "IMPORTING PHENOTYPE MAPPINGS..."
time node ../import-phenotype.js --file ../raw/phenotype.csv --host $SLURM_NODELIST --port 55555 --db_name plcogwas --user $DB_USER --password $DB_PASS
echo

echo "IMPORTING PARTICIPANT DATA..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-participant-data.sql
echo

echo "IMPORTING PARTICIPANT DATA CATEGORIES..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-participant-data-category.sql
echo

echo "IMPORTING PHENOTYPE CORRELATIONS..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 --local-infile=1 plcogwas < ../import-phenotype-correlation.sql
echo

echo "IMPORTING PARTICIPANT COUNTS..."
time node ../update-participant-count.js --host $SLURM_NODELIST --port 55555 --db_name plcogwas --user $DB_USER --password $DB_PASS
echo

echo "STOPPING MYSQL SERVER..."
local_mysql --basedir $BASE_DIR stop
echo

echo "DONE"
