#!/bin/bash

export DB_USER=$1
export DB_PASS=$2
export ARCHIVE_FILE=$3
export COMMANDS_FILE=$4
export NUM_JOBS=$5
export TMPDIR=/lscratch/$SLURM_JOB_ID

echo "LOADING MODULES (MySQL-5.7.22, GNU-Parallel, NodeJS)..."
module load mysql/5.7.22 parallel nodejs
echo

echo "RESTORING MYSQL DATABASE FROM ARCHIVE FILE $ARCHIVE_FILE ..."
time local_mysql restore --archivefile=$ARCHIVE_FILE
echo

echo "INJECTING SLURM_JOB_ID ENV VAR TO MYSQL CONFIGURATION FILE..."
envsubst < mysql.config > my.cnf
echo 

echo "COPYING OVER NEW MYSQL CONFIGURATION FILE..."
rm /lscratch/$SLURM_JOB_ID/mysql/my.cnf
cp ./my.cnf /lscratch/$SLURM_JOB_ID/mysql/
echo

echo "STARTING MYSQL SERVER..."
local_mysql start
echo

echo "LOGGING INTO MYSQL WITH DB_USER=$DB_USER, DB_PASS=$DB_PASS, HOST=$SLURM_NODELIST, PORT=55555..."
time mysql -u $DB_USER -p$DB_PASS --host=$SLURM_NODELIST --port=55555 plcogwas --execute="SELECT @@local_infile; SELECT @@innodb_buffer_pool_instances; SELECT @@innodb_buffer_pool_size; SELECT @@innodb_read_io_threads; SELECT @@innodb_write_io_threads; SELECT @@innodb_log_buffer_size; SELECT @@innodb_log_file_size; SELECT @@innodb_flush_log_at_trx_commit; SELECT @@key_buffer_size; SET GLOBAL unique_checks = 0; SET foreign_key_checks = 0; SET sql_log_bin = 0; SELECT @@unique_checks; SELECT @@foreign_key_checks; SELECT @@sql_log_bin;"
echo

echo "INJECTING CREDENTIALS TO gnu-parallel-import-melanoma-test.txt ..."
envsubst < $COMMANDS_FILE > gnu-parallel-import-commands.txt
echo

echo "SPAWNING TEST PARALLEL IMPORT PROCESSES..."
time parallel -j $NUM_JOBS < gnu-parallel-import-commands.txt
echo

echo "STOPPING MYSQL SERVER..."
local_mysql stop
echo

echo "COPYING MYSQL SERVER TO /data/$USER/plco/mysql/mysql-instance-$SLURM_JOB_ID ..."
mkdir /data/$USER/plco/mysql/mysql-instance-$SLURM_JOB_ID
time cp -avr /lscratch/$SLURM_JOB_ID/mysql /data/$USER/plco/mysql/mysql-instance-$SLURM_JOB_ID
echo

# echo "ARCHIVING MYSQL SERVER..."
# time local_mysql archive --archivefile=/data/$USER/plco/mysql/mysql-archive-$SLURM_JOB_ID.tgz
# echo

echo "DONE"
