#!/bin/bash

# ARGUMENT 1: Input MySQL db username
# DB_USER = "sample_username"
if [ -z "$1" ]
    then
        echo "ERROR: No MySQL db username supplied..."
        echo "USAGE: sh run-import-local-mysql.sh <DB_USER> <DB_PASS> <ARCHIVE_FILE> <COMMANDS_FILE> <NUM_JOBS>"
        echo "EXAMPLE: sh run-import-local-mysql.sh sample_username sample_password /data/jiangk3/plco/mysql/save.tgz gnu-parallel-import-melanoma-test-9x-full 9"
        exit 1
fi
DB_USER=$1

# ARGUMENT 2: Input MySQL db password
# DB_PASS = "sample_password"
if [ -z "$2" ]
    then
        echo "ERROR: No MySQL db password supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/jiangk3/plco/mysql/saved-instance-path /data/jiangk3/plco/mysql/rds-backup"
        exit 1
fi
DB_PASS=$2

# ARGUMENT 3: Input MySQL base directory path
# BASE_DIR = "/data/jiangk3/plco/mysql/saved-instance-path"
if [ -z "$3" ]
    then
        echo "ERROR: No MySQL base directory path supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/jiangk3/plco/mysql/saved-instance-path /data/jiangk3/plco/mysql/rds-backup"
        exit 1
fi
BASE_DIR=$3

# ARGUMENT 4: Input xtrabackup snapshot target directory path
# TARGET_DIR = "/data/jiangk3/plco/mysql/rds-backup"
if [ -z "$4" ]
    then
        echo "ERROR: No xtrabackup target directory path supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/jiangk3/plco/mysql/saved-instance-path /data/jiangk3/plco/mysql/rds-backup"
        exit 1
fi
TARGET_DIR=$4

sbatch --gres=lscratch:200 --mem=64g --cpus-per-task=32 --partition=norm --time=08:00:00 --wrap="sh xtrabackup-snapshot.sh $DB_USER $DB_PASS $BASE_DIR $TARGET_DIR"
