#!/bin/bash

# ARGUMENT 1: Input MySQL db username
# DB_USER = "sample_username"
if [ -z "$1" ]
    then
        echo "ERROR: No MySQL db username supplied..."
        echo "USAGE: sh run-create-local-mysql-base.sh <DB_USER> <DB_PASS>"
        echo "EXAMPLE: sh run-create-local-mysql-base.sh sample_username sample_password"
        exit 1
fi
DB_USER=$1

# ARGUMENT 2: Input MySQL db password
# DB_PASS = "sample_password"
if [ -z "$2" ]
    then
        echo "ERROR: No MySQL db password supplied..."
        echo "USAGE: sh run-create-local-mysql-base.sh <DB_USER> <DB_PASS>"
        echo "EXAMPLE: sh run-create-local-mysql-base.sh sample_username sample_password"
        exit 1
fi
DB_PASS=$2

sbatch --gres=lscratch:100 --mem=120g --cpus-per-task=8 --time=04:00:00 --wrap="sh create-local-mysql-base.sh $DB_USER $DB_PASS"
