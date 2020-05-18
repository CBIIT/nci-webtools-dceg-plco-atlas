#!/bin/bash

# SWARM file
SWARM_FILE="export-all-phenotypes.swarm"

# ARGUMENT 1: Input directory path
# INPUT_DIR="../raw/input"
if [ -z "$1" ]
    then
        echo "ERROR: No input path supplied..."
        echo "USAGE: sh run-swarm-parallel-export-variant.sh <INPUT_PATH> <OUTPUT_PATH> <OPTIONAL: --validate>"
        echo "EXAMPLE: sh run-swarm-parallel-export-variant.sh ../raw/input ../raw/output --validate"
        exit 1
fi
INPUT_DIR=$1

# ARGUMENT 2: Output directory path
# OUTPUT_DIR="../raw/output"
if [ -z "$2" ]
    then
        echo "ERROR: No output path supplied..."
        echo "USAGE: sh run-swarm-parallel-export-variant.sh <INPUT_PATH> <OUTPUT_PATH> <OPTIONAL: --validate>"
        echo "EXAMPLE: sh run-swarm-parallel-export-variant.sh ../raw/input ../raw/output --validate"
        exit 1
fi
OUTPUT_DIR=$2

# ARGUMENT 3: add --validate flag?
if [ $3 == "--validate" ]
    then
        VALIDATE=$3
    else
        if [ -z "$3" ]
            then
                VALIDATE=""
            else
                echo "ERROR: \"$3\" argument not recognized..."
                echo "USAGE: sh run-swarm-parallel-export-variant.sh <INPUT_PATH> <OUTPUT_PATH> <OPTIONAL: --validate>"
                echo "EXAMPLE: sh run-swarm-parallel-export-variant.sh ../raw/input ../raw/output --validate"
                exit 1
        fi
fi

# Temporary lscatch space directory path
TMP_DIR="/lscratch/\$SLURM_JOB_ID"

# Export script path
EXPORT_SCRIPT="../parallel-export-variant.js"

# Append requirements
DEPENDENCIES="module use ~/mymodules; module load nodejs; module load SQLite_3.31.1; sqlite3 --version;"

# Delete existing SWARM file if exists
if [ -e $SWARM_FILE ] 
then 
    echo "Delete existing SWARM file..."
    rm $SWARM_FILE
else
    echo "Creating new SWARM file..."
fi

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
            echo "$DEPENDENCIES node $EXPORT_SCRIPT --file $DFILE --output $OUTPUT_DIR --tmp $TMP_DIR $VALIDATE"
            echo "$DEPENDENCIES node $EXPORT_SCRIPT --file $DFILE --output $OUTPUT_DIR --tmp $TMP_DIR $VALIDATE" >> $SWARM_FILE
            echo ""
        done
    else
        echo "Found file: $FILE"
        echo "$DEPENDENCIES node $EXPORT_SCRIPT --file $FILE --output $OUTPUT_DIR --tmp $TMP_DIR $VALIDATE"
        echo "$DEPENDENCIES node $EXPORT_SCRIPT --file $FILE --output $OUTPUT_DIR --tmp $TMP_DIR $VALIDATE" >> $SWARM_FILE
        echo ""
    fi
done

# Run generated SWARM file
# -f <filename> = specify .swarm file
# -g <#> = number of gb for each process subjob
# --verbose <0-6> = choose verbose level, 6 being the most chatty
# --gres=lscratch:<#> = number of gb of tmp space for each process subjob
swarm -f $SWARM_FILE -g 4 --verbose 3 --gres=lscratch:10