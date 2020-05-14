#!/bin/bash

# SWARM file
SWARM_FILE="export-all-phenotypes.swarm"

# Input directory path
INPUT_DIR="../raw/input"

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
            echo "$DEPENDENCIES node $EXPORT_SCRIPT --file $DFILE"
            echo "$DEPENDENCIES node $EXPORT_SCRIPT --file $DFILE" >> $SWARM_FILE
            echo ""
        done
    else
        echo "Found file: $FILE"
        echo "$DEPENDENCIES node $EXPORT_SCRIPT --file $FILE"
        echo "$DEPENDENCIES node $EXPORT_SCRIPT --file $FILE" >> $SWARM_FILE
        echo ""
    fi
done

# Run generated SWARM file
# -f <filename> = specify .swarm file
# -g <#> = number of gb for each process subjob
# --verbose <0-6> = choose verbose level, 6 being the most chatty
swarm -f $SWARM_FILE -g 4 --verbose 3