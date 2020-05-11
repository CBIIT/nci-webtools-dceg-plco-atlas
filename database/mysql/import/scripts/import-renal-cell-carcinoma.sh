#!/bin/bash

module use ~/mymodules
module load nodejs
module load SQLite_3.31.1
sqlite3 --version
node parallel-export-variant-hpc.js --file "raw/renal_cell_carcinoma.csv" 10001 --phenotype --sex "all"
node parallel-export-variant-hpc.js --file "raw/ewings_sarcoma.csv" --phenotype 10001 --sex "female"
node parallel-export-variant-hpc.js --file "raw/melanoma.csv" --phenotype 10001 --sex "male"
