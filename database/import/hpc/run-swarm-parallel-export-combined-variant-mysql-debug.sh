#!/bin/bash

# SWARM file
SWARM_FILE="export-all-phenotypes.swarm"

# ARGUMENT 1: Input data directory path
# INPUT_DIR="../raw/input"
if [ -z "$1" ]
    then
        echo "ERROR: No input data path supplied..."
        echo "USAGE: sh run-swarm-parallel-export-variant-mysql-debug.sh <INPUT_PATH>"
        echo "EXAMPLE: sh run-swarm-parallel-export-variant-mysql-debug.sh ../raw/input"
        exit 1
fi
INPUT_DIR=$1

CURRENT_DATE=$(date +%F)

mkdir ./DEBUG_swarm_out_$CURRENT_DATE

# Log path
LOG_PATH="./DEBUG_swarm_out_$CURRENT_DATE/"

# Delete existing SWARM file if exists
if [ -e $SWARM_FILE ] 
then 
    echo "Delete existing SWARM file..."
    rm $SWARM_FILE
else
    echo "Creating new SWARM file..."
fi

# Initialize MySQL port (counter)
PORT=55550

# Generate SWARM file
echo "Generating SWARM script..."
for FILE in $INPUT_DIR/*
do
    if [ -d "$FILE" ]
    then
        echo "Browsing directory $FILE"
        for DFILE in $FILE/*
        do
            echo "Found file: $DFILE"
            echo "echo 'Starting export script...' ; local_mysql create --port $PORT ; echo 'Created MySQL instance...' ; local_mysql start --port $PORT ; echo 'Started MySQL instance...' ; local_mysql stop --port $PORT ; echo 'Stopped MySQL instance...'"
            echo "echo 'Starting export script...' ; local_mysql create --port $PORT ; echo 'Created MySQL instance...' ; local_mysql start --port $PORT ; echo 'Started MySQL instance...' ; local_mysql stop --port $PORT ; echo 'Stopped MySQL instance...'" >> $SWARM_FILE
            ((PORT=PORT+1))
            echo ""
        done
    else
        echo "Found file: $FILE"
        echo "echo 'Starting export script...' ; local_mysql create --port $PORT ; echo 'Created MySQL instance...' ; local_mysql start --port $PORT ; echo 'Started MySQL instance...' ; local_mysql stop --port $PORT ; echo 'Stopped MySQL instance...'"
        echo "echo 'Starting export script...' ; local_mysql create --port $PORT ; echo 'Created MySQL instance...' ; local_mysql start --port $PORT ; echo 'Started MySQL instance...' ; local_mysql stop --port $PORT ; echo 'Stopped MySQL instance...'" >> $SWARM_FILE
        ((PORT=PORT+1))
        echo ""
    fi
done

# Run generated SWARM file
# -f <filename> = specify .swarm file
# -t <#> = number of threads for each process subjob
# -g <#> = number of gb for each process subjob
# --verbose <0-6> = choose verbose level, 6 being the most chatty
# --gres=lscratch:<#> = number of gb of tmp space for each process subjob
swarm -f $SWARM_FILE -t 2 -g 4 --time 48:00:00 --verbose 6 --gres=lscratch:10 --logdir $LOG_PATH --module mysql/5.7.22 --merge-output