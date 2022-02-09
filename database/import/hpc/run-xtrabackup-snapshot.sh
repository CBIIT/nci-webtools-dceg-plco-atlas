#!/bin/bash

# ARGUMENT 1: Input MySQL db username
# DB_USER = "sample_username"
if [ -z "$1" ]
    then
        echo "ERROR: No MySQL db username supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR> <BUCKET_NAME> <BUCKET_FOLDER> <STREAM> <OPTIONAL: INCREMENTAL_BACKUP_PATH>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/<username>/plco/mysql/saved-instance-path /data/<username>/plco/mysql/rds-backup bucket_name bucket_folder xbstream <optional incremental path>"
        exit 1
fi
DB_USER=$1

# ARGUMENT 2: Input MySQL db password
# DB_PASS = "sample_password"
if [ -z "$2" ]
    then
        echo "ERROR: No MySQL db password supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR> <BUCKET_NAME> <BUCKET_FOLDER> <STREAM> <OPTIONAL: INCREMENTAL_BACKUP_PATH>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/<username>/plco/mysql/saved-instance-path /data/<username>/plco/mysql/rds-backup bucket_name bucket_folder xbstream <optional incremental path>"
        exit 1
fi
DB_PASS=$2

# ARGUMENT 3: Input MySQL base directory path
# BASE_DIR = "/data/<username>/plco/mysql/saved-instance-path"
if [ -z "$3" ]
    then
        echo "ERROR: No MySQL base directory path supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR> <BUCKET_NAME> <BUCKET_FOLDER> <STREAM> <OPTIONAL: INCREMENTAL_BACKUP_PATH>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/<username>/plco/mysql/saved-instance-path /data/<username>/plco/mysql/rds-backup bucket_name bucket_folder xbstream <optional incremental path>"
        exit 1
fi
BASE_DIR=$3

# ARGUMENT 4: Input xtrabackup snapshot target directory path
# TARGET_DIR = "/data/<username>/plco/mysql/rds-backup"
if [ -z "$4" ]
    then
        echo "ERROR: No xtrabackup target directory path supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR> <BUCKET_NAME> <BUCKET_FOLDER> <STREAM> <OPTIONAL: INCREMENTAL_BACKUP_PATH>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/<username>/plco/mysql/saved-instance-path /data/<username>/plco/mysql/rds-backup bucket_name bucket_folder xbstream <optional incremental path>"
        exit 1
fi
TARGET_DIR=$4

# ARGUMENT 5: Input AWS S3 bucket name
# BUCKET_NAME = "bucket_name"
if [ -z "$5" ]
    then
        echo "ERROR: No AWS S3 bucket name supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR> <BUCKET_NAME> <BUCKET_FOLDER> <STREAM> <OPTIONAL: INCREMENTAL_BACKUP_PATH>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/<username>/plco/mysql/saved-instance-path /data/<username>/plco/mysql/rds-backup bucket_name bucket_folder xbstream <optional incremental path>"
        exit 1
fi
BUCKET_NAME=$5

# ARGUMENT 6: Input AWS S3 bucket folder
# BUCKET_FOLDER = "bucket_folder"
if [ -z "$6" ]
    then
        echo "ERROR: No AWS S3 bucket subfolder name supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR> <BUCKET_NAME> <BUCKET_FOLDER> <STREAM> <OPTIONAL: INCREMENTAL_BACKUP_PATH>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/<username>/plco/mysql/saved-instance-path /data/<username>/plco/mysql/rds-backup bucket_name bucket_folder xbstream <optional incremental path>"
        exit 1
fi
BUCKET_FOLDER=$6

# ARGUMENT 7: Input stream type
# STREAM = "xbstream" or "full"
if [ -z "$7" ]
    then
        echo "ERROR: No stream type supplied (either 'full' or 'xbstream')..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR> <BUCKET_NAME> <BUCKET_FOLDER> <STREAM> <OPTIONAL: INCREMENTAL_BACKUP_PATH>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/<username>/plco/mysql/saved-instance-path /data/<username>/plco/mysql/rds-backup bucket_name bucket_folder xbstream <optional incremental path>"
        exit 1
fi
STREAM=$7

# ARGUMENT 8: Input xtrabackup incremental snapshot target directory path
# INCREMENTAL_FOLDER = "/data/<username>/plco/mysql/rds-backup/incremental1"
if [ -z "$8" ]
    then
        echo "Full backup..."
        INCREMENTAL_FOLDER=false 
    else
        echo "Incremental backup..."
        INCREMENTAL_FOLDER=$8
fi

sbatch --gres=lscratch:200 --mem=120g --cpus-per-task=28 --partition=norm --time=48:00:00 --wrap="sh xtrabackup-snapshot.sh $DB_USER $DB_PASS $BASE_DIR $TARGET_DIR $BUCKET_NAME $BUCKET_FOLDER $STREAM $INCREMENTAL_FOLDER"
