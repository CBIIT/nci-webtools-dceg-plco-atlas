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
        echo "USAGE: sh run-import-local-mysql.sh <DB_USER> <DB_PASS> <ARCHIVE_FILE> <COMMANDS_FILE> <NUM_JOBS>"
        echo "EXAMPLE: sh run-import-local-mysql.sh sample_username sample_password /data/jiangk3/plco/mysql/save.tgz gnu-parallel-import-melanoma-test-9x-full 9"
        exit 1
fi
DB_PASS=$2

# ARGUMENT 3: Input MySQL archive file path
# ARCHIVE_FILE = "/data/jiangk3/plco/mysql/save.tgz"
if [ -z "$3" ]
    then
        echo "ERROR: No gnu-parallel import commands file supplied..."
        echo "USAGE: sh run-import-local-mysql.sh <DB_USER> <DB_PASS> <ARCHIVE_FILE> <COMMANDS_FILE> <NUM_JOBS>"
        echo "EXAMPLE: sh run-import-local-mysql.sh sample_username sample_password /data/jiangk3/plco/mysql/save.tgz gnu-parallel-import-melanoma-test-9x-full 9"
        exit 1
fi
ARCHIVE_FILE=$3

# ARGUMENT 4: Input gnu-parallel import commands file
# COMMANDS_FILE = "gnu-parallel-import-melanoma-test-9x-full"
if [ -z "$4" ]
    then
        echo "ERROR: No gnu-parallel import commands file supplied..."
        echo "USAGE: sh run-import-local-mysql.sh <DB_USER> <DB_PASS> <ARCHIVE_FILE> <COMMANDS_FILE> <NUM_JOBS>"
        echo "EXAMPLE: sh run-import-local-mysql.sh sample_username sample_password /data/jiangk3/plco/mysql/save.tgz gnu-parallel-import-melanoma-test-9x-full 9"
        exit 1
fi
COMMANDS_FILE=$4

# ARGUMENT 5: Input number of parallel import jobs to run
# NUM_JOBS = 9
if [ -z "$5" ]
    then
        echo "ERROR: No number of parallel import jobs to run supplied..."
        echo "USAGE: sh run-import-local-mysql.sh <DB_USER> <DB_PASS> <ARCHIVE_FILE> <COMMANDS_FILE> <NUM_JOBS>"
        echo "EXAMPLE: sh run-import-local-mysql.sh sample_username sample_password /data/jiangk3/plco/mysql/save.tgz gnu-parallel-import-melanoma-test-9x-full 9"
        exit 1
fi
NUM_JOBS=$5

sbatch --gres=lscratch:200 --mem=512g --cpus-per-task=36 --partition=largemem --time=08:00:00 --wrap="sh import-local-mysql.sh $DB_USER $DB_PASS $ARCHIVE_FILE $COMMANDS_FILE $NUM_JOBS"
