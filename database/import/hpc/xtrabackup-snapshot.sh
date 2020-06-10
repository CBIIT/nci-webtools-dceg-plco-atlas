#!/bin/bash

export DB_USER=$1
export DB_PASS=$2
export BASE_DIR=$3
export TARGET_DIR=$4
export TMPDIR=/lscratch/$SLURM_JOB_ID

module load mysql/5.7.22
module use ~/mymodules
module load xtrabackup_2.4.20

echo "INJECTING BASE_DIR ENV VAR TO MYSQL CONFIGURATION FILE..."
envsubst < mysql-basedir.config > my.cnf
echo 

echo "COPYING OVER NEW MYSQL CONFIGURATION FILE..."
rm $BASE_DIR/my.cnf
cp ./my.cnf $BASE_DIR
echo

echo "STARTING MYSQL SERVER..."
local_mysql --basedir $BASE_DIR start
echo 

echo "Backing up (MySQL-5.7.22, host=$SLURM_NODELIST, user=$DB_USER,basedir=$BASE_DIR, targetdir=$TARGET_DIR)..."
time xtrabackup --backup --host=$SLURM_NODELIST --port=55555  --user=$DB_USER --password=$DB_PASS --datadir=$BASE_DIR/data/ --stream=xbstream --parallel=16 --target-dir=$TARGET_DIR | split -d --bytes=500MB - $TARGET_DIR/backup.xbstream
echo

echo "Done"