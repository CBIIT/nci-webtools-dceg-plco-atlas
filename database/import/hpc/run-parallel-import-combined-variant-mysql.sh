#!/bin/bash

# ARGUMENT 1: Input data directory path
# INPUT_DIR="../raw/output_ibd"
if [ -z "$1" ]
    then
        echo "ERROR: No input path supplied..."
        echo "USAGE: sh run-parallel-import-combined-variant-mysql.sh <INPUT_DIR> <BASE_DIR> <USER> <PASSWORD>"
        echo "EXAMPLE: sh run-parallel-import-combined-variant-mysql.sh ../raw/output_ibd /data/jiangk3/plco/mysql/mysql-instance-base sample_username sample_password"
        exit 1
fi
INPUT_DIR=$1

# ARGUMENT 2: Input MySQL base directory path
# BASE_DIR="/data/jiangk3/plco/mysql/mysql-instance-base"
if [ -z "$2" ]
    then
        echo "ERROR: No input path supplied..."
        echo "USAGE: sh run-parallel-import-combined-variant-mysql.sh <INPUT_DIR> <BASE_DIR> <USER> <PASSWORD>"
        echo "EXAMPLE: sh run-parallel-import-combined-variant-mysql.sh ../raw/output_ibd /data/jiangk3/plco/mysql/mysql-instance-base sample_username sample_password"
        exit 1
fi
BASE_DIR=$2

# ARGUMENT 3: MySQL db username
# USER="sample_username"
if [ -z "$3" ]
    then
        echo "ERROR: No MySQL db username supplied..."
        echo "USAGE: sh run-parallel-import-combined-variant-mysql.sh <INPUT_DIR> <BASE_DIR> <USER> <PASSWORD>"
        echo "EXAMPLE: sh run-parallel-import-combined-variant-mysql.sh ../raw/output_ibd /data/jiangk3/plco/mysql/mysql-instance-base sample_username sample_password"
        exit 1
fi
USER=$3

# ARGUMENT 4: MySQL db password
# PASSWORD="sample_password"
if [ -z "$4" ]
    then
        echo "ERROR: No MySQL db password supplied..."
        echo "USAGE: sh run-parallel-import-combined-variant-mysql.sh <INPUT_DIR> <BASE_DIR> <USER> <PASSWORD>"
        echo "EXAMPLE: sh run-parallel-import-combined-variant-mysql.sh ../raw/output_ibd /data/jiangk3/plco/mysql/mysql-instance-base sample_username sample_password"
        exit 1
fi
PASSWORD=$4

CURRENT_DATE=$(date +%F_%H:%M:%S)

mkdir ./sbatch_import_out_$CURRENT_DATE

# Log path
LOG_PATH="./sbatch_import_out_$CURRENT_DATE/"

sbatch --gres=lscratch:200 --mem=224g --cpus-per-task=8 --time=48:00:00 --output=$LOG_PATH/sbatch.out --wrap="sh parallel-import-combined-variant-mysql.sh $INPUT_DIR $BASE_DIR $USER $PASSWORD $LOG_PATH"
