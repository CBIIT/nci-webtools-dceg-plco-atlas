#!/bin/bash

# GNU Parallel file
PARALLEL_FILE="gnu-parallel-import-all-phenotypes.txt"
# Export script path
IMPORT_SCRIPT="../parallel-import-variant.js"

# ARGUMENT 1: Data directory path
# DATA_DIR="../raw/output"
if [ -z "$1" ]
    then
        echo "ERROR: No input path supplied..."
        echo "USAGE: sh create-gnu-parallel-script.sh <DATA_DIR>"
        echo "EXAMPLE: sh create-gnu-parallel-script.sh ../raw/output"
        exit 1
fi
DATA_DIR=$1

# Delete existing GNU Parallel file if exists
if [ -e $PARALLEL_FILE ] 
then 
    echo "Delete existing GNU Parallel file..."
    rm $PARALLEL_FILE
else
    echo "Creating new GNU Parallel file..."
fi

# Generate GNU Parallel file
echo "Generating GNU Parallel scripts..."
FILES_LS=$(ls $DATA_DIR | sed -e "s/.aggregate//" -e "s/.metadata//" -e "s/.variant//" -e "s/.csv$//" | sort -u)
for PHENOTYPE_GENDER in $FILES_LS
do
    echo "Found phenotype: $PHENOTYPE_GENDER"
    echo "node $IMPORT_SCRIPT --file $DATA_DIR/$PHENOTYPE_GENDER --host \$SLURM_NODELIST --port 55555 --db_name plcogwas --user \$DB_USER --password \$DB_PASS"
    echo "node $IMPORT_SCRIPT --file $DATA_DIR/$PHENOTYPE_GENDER --host \$SLURM_NODELIST --port 55555 --db_name plcogwas --user \$DB_USER --password \$DB_PASS" >> $PARALLEL_FILE
    echo ""
done