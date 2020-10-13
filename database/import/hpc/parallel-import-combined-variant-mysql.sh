#!/bin/bash

export INPUT_DIR=$1
export BASE_DIR=$2
export USER=$3
export PASSWORD=$4
export LOG_PATH=$5
export TMPDIR=/lscratch/$SLURM_JOB_ID

echo "LOADING MODULES (MySQL-5.7.22, NodeJS)..."
module load mysql/5.7.22 nodejs
echo

echo "STARTING MYSQL DATABASE FROM BASE DIR $BASE_DIR..."
time local_mysql --basedir $BASE_DIR start --force
echo

echo "LOGGING INTO MYSQL WITH DB_USER=$USER, DB_PASS=$PASSWORD, HOST=$SLURM_NODELIST, PORT=55555..."
echo "DROPPING EXISTING STAGE TABLES..."
time mysql -u $USER -p$PASSWORD --host=$SLURM_NODELIST --port=55555 plcogwas --execute="SET GLOBAL innodb_file_per_table=ON; SELECT @@innodb_file_per_table; SELECT @@key_buffer_size; DROP TABLE participant_data_stage; DROP TABLE participant_data_category_stage;"
echo

echo "STARTING SCRIPT ..."
time node ../parallel-import-combined-variant-mysql.js --folder $INPUT_DIR --port 55555 --user $USER --password $PASSWORD --logdir $LOG_PATH
echo

echo "STOPPING MYSQL SERVER..."
local_mysql --basedir $BASE_DIR stop
echo

echo "DONE"
