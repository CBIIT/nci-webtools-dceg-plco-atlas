#!/bin/bash

module load nodejs
node parallel-export-variant.js --sqlite "./sqlite3" --file "raw/ewings_sarcoma_1000.csv" --phenotype_id 10001 --sex "all"
node parallel-export-variant.js --sqlite "./sqlite3" --file "raw/melanoma.csv" --phenotype_id 10001 --sex "female"
node parallel-export-variant.js --sqlite "./sqlite3" --file "raw/renal_cell_carcinoma.csv" 10001 --phenotype_id --sex "male"

