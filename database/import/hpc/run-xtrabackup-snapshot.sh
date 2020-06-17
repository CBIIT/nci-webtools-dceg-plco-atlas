#!/bin/bash

# ARGUMENT 1: Input MySQL db username
# DB_USER = "sample_username"
if [ -z "$1" ]
    then
        echo "ERROR: No MySQL db username supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/jiangk3/plco/mysql/saved-instance-path /data/jiangk3/plco/mysql/rds-backup"
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

# ARGUMENT 5: Input AWS ACCESS KEY
# AWS_ACCESS_KEY_ID = "aws_access_key_id"
if [ -z "$5" ]
    then
        echo "ERROR: No AWS access key supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR> <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/jiangk3/plco/mysql/saved-instance-path /data/jiangk3/plco/mysql/rds-backup aws_access_key_id aws_secret_access_key"
        exit 1
fi
AWS_ACCESS_KEY_ID=$5

# ARGUMENT 6: Input AWS SECRET ACCESS KEY
# AWS_SECRET_ACCESS_KEY = "aws_secret_access_key"
if [ -z "$6" ]
    then
        echo "ERROR: No AWS secret access key supplied..."
        echo "USAGE: sh run-xtrabackup-snapshot.sh <DB_USER> <DB_PASS> <BASE_DIR> <TARGET_DIR> <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY>"
        echo "EXAMPLE: sh run-xtrabackup-snapshot.sh sample_username sample_password /data/jiangk3/plco/mysql/saved-instance-path /data/jiangk3/plco/mysql/rds-backup aws_access_key_id aws_secret_access_key"
        exit 1
fi
AWS_SECRET_ACCESS_KEY=$6

sbatch --gres=lscratch:200 --mem=64g --cpus-per-task=32 --partition=norm --time=08:00:00 --wrap="sh xtrabackup-snapshot.sh $DB_USER $DB_PASS $BASE_DIR $TARGET_DIR $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY"
