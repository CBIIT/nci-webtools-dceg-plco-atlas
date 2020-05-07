#!/bin/bash

module load SQLite --latest
node parallel-export-variant-hpc.js --file "raw/ewings_sarcoma.csv" --phenotype_id 10001 --sex "all"
node parallel-export-variant-hpc.js --file "raw/melanoma.csv" --phenotype_id 10001 --sex "female"
node parallel-export-variant-hpc.js --file "raw/renal_cell_carcinoma.csv" 10001 --phenotype_id --sex "male"

