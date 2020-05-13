#!/bin/bash

module use ~/mymodules
module load nodejs
module load SQLite_3.31.1
sqlite3 --version
node parallel-export-variant.js --file "raw/melanoma.csv" --phenotype 10002 --sex "all"
node parallel-export-variant.js --file "raw/melanoma.csv" --phenotype 10002 --sex "female"
node parallel-export-variant.js --file "raw/melanoma.csv" --phenotype 10002 --sex "male"