#!/bin/bash

module load SQLite --latest
node parallel-export-variant.js raw/renal_cell_carcinoma.csv
