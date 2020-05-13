#!/bin/bash

module use ~/mymodules
module load nodejs
module load SQLite_3.31.1
sqlite3 --version
node parallel-export-variant.js --file "raw/renal_cell_carcinoma.csv" --phenotype 10003 --sex "all"
node parallel-export-variant.js --file "raw/renal_cell_carcinoma.csv" --phenotype 10003 --sex "female"
node parallel-export-variant.js --file "raw/renal_cell_carcinoma.csv" --phenotype 10003 --sex "male"
