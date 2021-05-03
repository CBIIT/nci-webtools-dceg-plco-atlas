#!/bin/bash

export DB_USER=$1
export DB_PASS=$2
export BASE_DIR=$3
export TARGET_DIR=$4
export BUCKET_NAME=$5
export BUCKET_FOLDER=$6
# export AWS_ACCESS_KEY_ID=$5
# export AWS_SECRET_ACCESS_KEY=$6
export TMPDIR=/lscratch/$SLURM_JOB_ID
# export SERVER_HOST=$SLURM_NODELIST
export STREAM=$7
export INCREMENTAL_FOLDER=$8

module load mysql/5.7.22
# module load mysql/8.0
module use ~/mymodules
module load xtrabackup_2.4.20
# module load xtrabackup_8.0.22

[ -d $TARGET_DIR ] && echo "$TARGET_DIR directory already exists" || mkdir $TARGET_DIR

echo "STARTING MYSQL SERVER..."
local_mysql --basedir $BASE_DIR start --force
echo 

echo "BACKING UP VIA XTRABACKUP (MySQL-5.7.22, host=$SLURM_NODELIST, user=$DB_USER,basedir=$BASE_DIR, targetdir=$TARGET_DIR)..."
if [ $INCREMENTAL_FOLDER = false ]
then
    # Full backup...
    if [ $STREAM = "xbstream" ]
    then
        time xtrabackup --backup --host=$SLURM_NODELIST --port=55555  --user=$DB_USER --password=$DB_PASS --datadir=$BASE_DIR/data/ --stream=xbstream --parallel=16 --target-dir=$TARGET_DIR | split -d --bytes=2048MB - $TARGET_DIR/backup.xbstream
    else
        time xtrabackup --backup --host=$SLURM_NODELIST --port=55555  --user=$DB_USER --password=$DB_PASS --datadir=$BASE_DIR/data/ --parallel=16 --target-dir=$TARGET_DIR
    fi
else
    # Incremental backup...  
    if [ $STREAM = "xbstream" ]
    then
        time xtrabackup --backup --host=$SLURM_NODELIST --incremental-basedir=$INCREMENTAL_FOLDER --port=55555  --user=$DB_USER --password=$DB_PASS --datadir=$BASE_DIR/data/ --stream=xbstream --parallel=16 --target-dir=$TARGET_DIR | split -d --bytes=2048MB - $TARGET_DIR/backup.xbstream
    else
        time xtrabackup --backup --host=$SLURM_NODELIST --incremental-basedir=$INCREMENTAL_FOLDER --port=55555  --user=$DB_USER --password=$DB_PASS --datadir=$BASE_DIR/data/ --parallel=16 --target-dir=$TARGET_DIR
    fi
fi
echo

echo "STOPPING MYSQL SERVER..."
local_mysql --basedir $BASE_DIR stop
echo 

# SSH HELIX

echo "RUNNING AWS SYNC IN HELIX..."
ssh -o StrictHostKeyChecking=no helix "module load aws; time aws s3 sync $TARGET_DIR s3://$BUCKET_NAME/$BUCKET_FOLDER;"
echo 

echo "Done"