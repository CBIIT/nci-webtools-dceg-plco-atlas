#!/bin/bash

# ARGUMENT 1: Input MySQL db username
# DB_USER = "sample_username"
if [ -z "$1" ]
    then
        echo "ERROR: No MySQL db username supplied..."
        echo "USAGE: sh run-import-local-mysql-5.7-base-archive.sh <DB_USER> <DB_PASS>"
        echo "EXAMPLE: sh run-import-local-mysql-5.7-base-archive.sh sample_username sample_password"
        exit 1
fi
DB_USER=$1

# ARGUMENT 2: Input MySQL db password
# DB_PASS = "sample_password"
if [ -z "$2" ]
    then
        echo "ERROR: No MySQL db password supplied..."
        echo "USAGE: sh run-import-local-mysql-5.7-base-archive.sh <DB_USER> <DB_PASS>"
        echo "EXAMPLE: sh run-import-local-mysql-5.7-base-archive.sh sample_username sample_password"
        exit 1
fi
DB_PASS=$2

sbatch --gres=lscratch:100 --mem=128g --cpus-per-task=32 --partition=norm --time=08:00:00 --wrap="sh import-local-mysql-5.7-base-archive.sh $DB_USER $DB_PASS"
