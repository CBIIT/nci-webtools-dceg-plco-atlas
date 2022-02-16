#!/bin/bash

# SWARM file
SWARM_FILE="export-all-phenotypes.swarm"

# ARGUMENT 1: MySQL db username
# USER="sample_username"
if [ -z "$1" ]
    then
        echo "ERROR: No MySQL db username supplied..."
        echo "USAGE: sh run-swarm-parallel-export-variant-mysql.sh <USER> <PASSWORD> <INPUT_PATH> <OUTPUT_PATH> <PHENOTYPE_FILE>"
        echo "EXAMPLE: sh run-swarm-parallel-export-variant-mysql.sh sample_username sample_password ../raw/input ../raw/output ../phenotype.csv"
        exit 1
fi
USER=$1

# ARGUMENT 2: MySQL db password
# PASSWORD="sample_password"
if [ -z "$2" ]
    then
        echo "ERROR: No MySQL db password supplied..."
        echo "USAGE: sh run-swarm-parallel-export-variant-mysql.sh <USER> <PASSWORD> <INPUT_PATH> <OUTPUT_PATH> <PHENOTYPE_FILE>"
        echo "EXAMPLE: sh run-swarm-parallel-export-variant-mysql.sh sample_username sample_password ../raw/input ../raw/output ../phenotype.csv"
        exit 1
fi
PASSWORD=$2

# ARGUMENT 3: Input data directory path
# INPUT_DIR="../raw/input"
if [ -z "$3" ]
    then
        echo "ERROR: No input data path supplied..."
        echo "USAGE: sh run-swarm-parallel-export-variant-mysql.sh <USER> <PASSWORD> <INPUT_PATH> <OUTPUT_PATH> <PHENOTYPE_FILE>"
        echo "EXAMPLE: sh run-swarm-parallel-export-variant-mysql.sh sample_username sample_password ../raw/input ../raw/output ../phenotype.csv"
        exit 1
fi
INPUT_DIR=$3

# ARGUMENT 4: Output directory path
# OUTPUT_DIR="../raw/output"
if [ -z "$4" ]
    then
        echo "ERROR: No output path supplied..."
        echo "USAGE: sh run-swarm-parallel-export-variant-mysql.sh <USER> <PASSWORD> <INPUT_PATH> <OUTPUT_PATH> <PHENOTYPE_FILE>"
        echo "EXAMPLE: sh run-swarm-parallel-export-variant-mysql.sh sample_username sample_password ../raw/input ../raw/output ../phenotype.csv"
        exit 1
fi
OUTPUT_DIR=$4

# ARGUMENT 5: phenotype.csv path
# PHENOTYPE_FILE="../raw/output"
if [ -z "$5" ]
    then
        echo "ERROR: No phenotype.csv path supplied..."
        echo "USAGE: sh run-swarm-parallel-export-variant-mysql.sh <USER> <PASSWORD> <INPUT_PATH> <OUTPUT_PATH> <PHENOTYPE_FILE>"
        echo "EXAMPLE: sh run-swarm-parallel-export-variant-mysql.sh sample_username sample_password ../raw/input ../raw/output ../phenotype.csv"
        exit 1
fi
PHENOTYPE_FILE=$5

CURRENT_DATE=$(date +%F_%H:%M:%S)

mkdir ./swarm_export_out_$CURRENT_DATE

# Log path
LOG_PATH="./swarm_export_out_$CURRENT_DATE/"

# Temporary lscatch space directory path
TMP_DIR="/lscratch/\$SLURM_JOB_ID/mysql/"

# Initialize MySQL port (incremented per job)
PORT=10000

# Export script path
EXPORT_SCRIPT="../parallel-export-combined-variant-mysql.js"

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
            echo "echo 'Creating MySQL instance...' ; local_mysql create --port $PORT ; echo 'Created MySQL instance.' ; echo 'Configuring MySQL instance...' ; cp mysql-lscratch.config  /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; sed -i 's/<PORT>/$PORT/g' /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; sed -i \"s/<SLURM_JOB_ID>/\$SLURM_JOB_ID/g\" /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; echo 'Configured MySQL instance.' ; echo 'Starting MySQL instance...' ; local_mysql start --port $PORT ; echo 'Started MySQL instance.' ; echo 'Creating MySQL user...' ; mysql -u root -p'mysql123' --socket=$TMP_DIR/mysql.sock --execute=\"CREATE USER '$USER'@'localhost' IDENTIFIED BY '$PASSWORD'; GRANT ALL PRIVILEGES ON *.* TO '$USER'@'localhost' WITH GRANT OPTION; CREATE USER '$USER'@'%' IDENTIFIED BY '$PASSWORD';GRANT ALL PRIVILEGES ON *.* TO '$USER'@'%' WITH GRANT OPTION; CREATE DATABASE plcogwas CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;\" ; echo 'Created MySQL user.' ; node $EXPORT_SCRIPT --port $PORT --user $USER --password $PASSWORD --file $DFILE --phenotype_file $PHENOTYPE_FILE --output $OUTPUT_DIR --logdir $LOG_PATH --tmp $TMP_DIR ; echo 'Stopping MySQL instance...' ; local_mysql stop --port $PORT ; echo 'Stopped MySQL instance.' ;"
            echo "echo 'Creating MySQL instance...' ; local_mysql create --port $PORT ; echo 'Created MySQL instance.' ; echo 'Configuring MySQL instance...' ; cp mysql-lscratch.config  /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; sed -i 's/<PORT>/$PORT/g' /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; sed -i \"s/<SLURM_JOB_ID>/\$SLURM_JOB_ID/g\" /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; echo 'Configured MySQL instance.' ; echo 'Starting MySQL instance...' ; local_mysql start --port $PORT ; echo 'Started MySQL instance.' ; echo 'Creating MySQL user...' ; mysql -u root -p'mysql123' --socket=$TMP_DIR/mysql.sock --execute=\"CREATE USER '$USER'@'localhost' IDENTIFIED BY '$PASSWORD'; GRANT ALL PRIVILEGES ON *.* TO '$USER'@'localhost' WITH GRANT OPTION; CREATE USER '$USER'@'%' IDENTIFIED BY '$PASSWORD';GRANT ALL PRIVILEGES ON *.* TO '$USER'@'%' WITH GRANT OPTION; CREATE DATABASE plcogwas CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;\" ; echo 'Created MySQL user.' ; node $EXPORT_SCRIPT --port $PORT --user $USER --password $PASSWORD --file $DFILE --phenotype_file $PHENOTYPE_FILE --output $OUTPUT_DIR --logdir $LOG_PATH --tmp $TMP_DIR ; echo 'Stopping MySQL instance...' ; local_mysql stop --port $PORT ; echo 'Stopped MySQL instance.' ;" >> $SWARM_FILE
            echo ""
            ((PORT=PORT+1))
        done
    else
        echo "Found file: $FILE"
        echo "echo 'Creating MySQL instance...' ; local_mysql create --port $PORT ; echo 'Created MySQL instance.' ; echo 'Configuring MySQL instance...' ; cp mysql-lscratch.config  /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; sed -i 's/<PORT>/$PORT/g' /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; sed -i \"s/<SLURM_JOB_ID>/\$SLURM_JOB_ID/g\" /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; echo 'Configured MySQL instance.' ; echo 'Starting MySQL instance...' ; local_mysql start --port $PORT ; echo 'Started MySQL instance.' ; echo 'Creating MySQL user...' ; mysql -u root -p'mysql123' --socket=$TMP_DIR/mysql.sock --execute=\"CREATE USER '$USER'@'localhost' IDENTIFIED BY '$PASSWORD'; GRANT ALL PRIVILEGES ON *.* TO '$USER'@'localhost' WITH GRANT OPTION; CREATE USER '$USER'@'%' IDENTIFIED BY '$PASSWORD';GRANT ALL PRIVILEGES ON *.* TO '$USER'@'%' WITH GRANT OPTION; CREATE DATABASE plcogwas CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;\" ; echo 'Created MySQL user.' ; node $EXPORT_SCRIPT --port $PORT --user $USER --password $PASSWORD --file $FILE --phenotype_file $PHENOTYPE_FILE --output $OUTPUT_DIR --logdir $LOG_PATH --tmp $TMP_DIR ; echo 'Stopping MySQL instance...' ; local_mysql stop --port $PORT ; echo 'Stopped MySQL instance.' ;"
        echo "echo 'Creating MySQL instance...' ; local_mysql create --port $PORT ; echo 'Created MySQL instance.' ; echo 'Configuring MySQL instance...' ; cp mysql-lscratch.config  /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; sed -i 's/<PORT>/$PORT/g' /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; sed -i \"s/<SLURM_JOB_ID>/\$SLURM_JOB_ID/g\" /lscratch/\$SLURM_JOB_ID/mysql/my.cnf ; echo 'Configured MySQL instance.' ; echo 'Starting MySQL instance...' ; local_mysql start --port $PORT ; echo 'Started MySQL instance.' ; echo 'Creating MySQL user...' ; mysql -u root -p'mysql123' --socket=$TMP_DIR/mysql.sock --execute=\"CREATE USER '$USER'@'localhost' IDENTIFIED BY '$PASSWORD'; GRANT ALL PRIVILEGES ON *.* TO '$USER'@'localhost' WITH GRANT OPTION; CREATE USER '$USER'@'%' IDENTIFIED BY '$PASSWORD';GRANT ALL PRIVILEGES ON *.* TO '$USER'@'%' WITH GRANT OPTION; CREATE DATABASE plcogwas CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;\" ; echo 'Created MySQL user.' ; node $EXPORT_SCRIPT --port $PORT --user $USER --password $PASSWORD --file $FILE --phenotype_file $PHENOTYPE_FILE --output $OUTPUT_DIR --logdir $LOG_PATH --tmp $TMP_DIR ; echo 'Stopping MySQL instance...' ; local_mysql stop --port $PORT ; echo 'Stopped MySQL instance.' ;" >> $SWARM_FILE
        echo ""
        ((PORT=PORT+1))
    fi
done

[ -d $OUTPUT_DIR ] && echo "$OUTPUT_DIR directory already exists" || mkdir $OUTPUT_DIR

# Run generated SWARM file
# -f <filename> = specify .swarm file
# -t <#> = number of threads for each process subjob
# -g <#> = number of gb for each process subjob
# --verbose <0-6> = choose verbose level, 6 being the most chatty
# --gres=lscratch:<#> = number of gb of tmp space for each process subjob
# swarm -f $SWARM_FILE -t 8 -g 64 --time 48:00:00 --verbose 6 --gres=lscratch:300 --logdir $LOG_PATH --module mysql/8.0,nodejs --merge-output
swarm -f $SWARM_FILE -t 4 -g 32 --time 48:00:00 --verbose 6 --gres=lscratch:300 --logdir $LOG_PATH --module mysql/5.7.22,nodejs --merge-output