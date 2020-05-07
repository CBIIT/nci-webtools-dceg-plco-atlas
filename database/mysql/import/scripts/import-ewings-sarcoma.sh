#!/bin/bash

module use ~/mymodules
module load nodejs
module load SQLite_3.31.1
sqlite3 --version
node parallel-export-variant-hpc.js --file "raw/ewings_sarcoma_1000.csv" --phenotype_id 10001 --sex "all"
# node parallel-export-variant.js --file "raw/melanoma.csv" --phenotype_id 10001 --sex "female"
# node parallel-export-variant.js --file "raw/renal_cell_carcinoma.csv" 10001 --phenotype_id --sex "male"