#!/bin/bash

# ARGUMENT 1: Input MySQL db username
# DB_USER = "sample_username"
if [ -z "$1" ]
    then
        echo "ERROR: No MySQL db username supplied..."
        echo "USAGE: sh run-create-local-mysql-base.sh <DB_USER> <DB_PASS> <TARGET_DIR>"
        echo "EXAMPLE: sh run-create-local-mysql-base.sh sample_username sample_password /data/<username>/plco/mysql/"
        exit 1
fi
DB_USER=$1

# ARGUMENT 2: Input MySQL db password
# DB_PASS = "sample_password"
if [ -z "$2" ]
    then
        echo "ERROR: No MySQL db password supplied..."
        echo "USAGE: sh run-create-local-mysql-base.sh <DB_USER> <DB_PASS> <TARGET_DIR>"
        echo "EXAMPLE: sh run-create-local-mysql-base.sh sample_username sample_password /data/<username>/plco/mysql/"
        exit 1
fi
DB_PASS=$2

# ARGUMENT 3: Input target directory to save MySQL instance base 
# TARGET_DIR="/data/<username>/plco/mysql/"
if [ -z "$3" ]
    then
        echo "ERROR: No target directory supplied..."
        echo "USAGE: sh run-create-local-mysql-base.sh <DB_USER> <DB_PASS> <TARGET_DIR>"
        echo "EXAMPLE: sh run-create-local-mysql-base.sh sample_username sample_password /data/<username>/plco/mysql/"
        exit 1
fi
TARGET_DIR=$3

sbatch --gres=lscratch:100 --mem=32g --cpus-per-task=4 --partition=quick --time=04:00:00 --wrap="sh create-local-mysql-base.sh $DB_USER $DB_PASS $TARGET_DIR"
