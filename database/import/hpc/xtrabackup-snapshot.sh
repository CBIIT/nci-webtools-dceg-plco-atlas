#!/bin/bash

export DB_USER=$1
export DB_PASS=$2
export BASE_DIR=$3
export TARGET_DIR=$4
export AWS_ACCESS_KEY_ID=$5
export AWS_SECRET_ACCESS_KEY=$6
export TMPDIR=/lscratch/$SLURM_JOB_ID
export SERVER_HOST=$SLURM_NODELIST

module load mysql/5.7.22
# module use ~/mymodules
# module load xtrabackup_2.4.20

echo "INJECTING BASE_DIR ENV VAR TO MYSQL CONFIGURATION FILE..."
envsubst < mysql-basedir.config > my.cnf
echo 

echo "COPYING OVER NEW MYSQL CONFIGURATION FILE..."
rm $BASE_DIR/my.cnf
cp ./my.cnf $BASE_DIR
echo

[ -d $TARGET_DIR ] && echo "$TARGET_DIR directory already exists" || mkdir $TARGET_DIR

echo "STARTING MYSQL SERVER..."
local_mysql --basedir $BASE_DIR start
echo 

# SSH HELIX

echo "RUNNING XTRABACKUP IN HELIX..."
ssh -o StrictHostKeyChecking=no helix "module load mysql/5.7.22; module use ~/mymodules; module load xtrabackup_2.4.20; time xtrabackup --backup --host=$SERVER_HOST --port=55555  --user=$DB_USER --password=$DB_PASS --datadir=$BASE_DIR/data/ --stream=xbstream --extra-lsndir=$TARGET_DIR --target-dir=$TARGET_DIR | xbcloud put --storage=s3 --s3-endpoint='s3.amazonaws.com' --s3-access-key=$AWS_ACCESS_KEY_ID --s3-secret-key=$AWS_SECRET_ACCESS_KEY --s3-bucket='plco-gwas-test-data' --parallel=8 snapshot-xbcloud;"
echo 

# echo "Backing up (MySQL-5.7.22, host=$SLURM_NODELIST, user=$DB_USER,basedir=$BASE_DIR, targetdir=$TARGET_DIR)..."
# time xtrabackup --backup --host=$SLURM_NODELIST --port=55555  --user=$DB_USER --password=$DB_PASS --datadir=$BASE_DIR/data/ --stream=xbstream --parallel=16 --target-dir=$TARGET_DIR | split -d --bytes=500MB - $TARGET_DIR/backup.xbstream
# echo

# echo "Backing up (MySQL-5.7.22, host=$SERVER_HOST, user=$DB_USER,basedir=$BASE_DIR, targetdir=$TARGET_DIR)..."
# time xtrabackup --backup --host=$SERVER_HOST --port=55555  --user=$DB_USER --password=$DB_PASS --datadir=$BASE_DIR/data/ --stream=xbstream --extra-lsndir=$TARGET_DIR --target-dir=$TARGET_DIR | xbcloud put --storage=s3 --s3-endpoint='s3.amazonaws.com' --s3-access-key=$AWS_ACCESS_KEY_ID --s3-secret-key=$AWS_SECRET_ACCESS_KEY --s3-bucket='plco-gwas-test-data' --parallel=8 snapshot-xbstream
# echo

# exit

# echo "Backing up (MySQL-5.7.22, host=$SLURM_NODELIST, user=$DB_USER,basedir=$BASE_DIR, targetdir=$TARGET_DIR)..."
# time xtrabackup --backup --host=$SERVER_HOST --port=55555  --user=$DB_USER --password=$DB_PASS --datadir=$BASE_DIR/data/ --parallel=16 --target-dir=$TARGET_DIR 
# echo

# EXIT HELIX

echo "STOPPING MYSQL SERVER..."
local_mysql --basedir $BASE_DIR stop
echo 

echo "Done"