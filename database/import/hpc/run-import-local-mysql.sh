#!/bin/bash

# ARGUMENT 1: Input MySQL db username
# DB_USER="sample_username"
if [ -z "$1" ]
    then
        echo "ERROR: No MySQL db username supplied..."
        echo "USAGE: sh run-import-local-mysql.sh <DB_USER> <DB_PASS> <ARCHIVE_FILE>"
        echo "EXAMPLE: sh run-import-local-mysql.sh sample_username sample_password /data/jiangk3/plco/mysql/save.tgz"
        exit 1
fi
DB_USER=$1

# ARGUMENT 2: Input MySQL db password
# DB_PASS="sample_password"
if [ -z "$2" ]
    then
        echo "ERROR: No MySQL db password supplied..."
        echo "USAGE: sh run-import-local-mysql.sh <DB_USER> <DB_PASS> <ARCHIVE_FILE>"
        echo "EXAMPLE: sh run-import-local-mysql.sh sample_username sample_password /data/jiangk3/plco/mysql/save.tgz"
        exit 1
fi
DB_PASS=$2

# ARGUMENT 3: Input MySQL archive file path
# ARCHIVE_FILE="/data/jiangk3/plco/mysql/save.tgz"
if [ -z "$3" ]
    then
        echo "ERROR: No MySQL archive file supplied..."
        echo "USAGE: sh run-import-local-mysql.sh <DB_USER> <DB_PASS> <ARCHIVE_FILE>"
        echo "EXAMPLE: sh run-import-local-mysql.sh sample_username sample_password /data/jiangk3/plco/mysql/save.tgz"
        exit 1
fi
ARCHIVE_FILE=$3

sbatch --gres=lscratch:100 --mem=64g --cpus-per-task=16 --partition=norm --wrap="sh import-local-mysql.sh $DB_USER $DB_PASS $ARCHIVE_FILE"
