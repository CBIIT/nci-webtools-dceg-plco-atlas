#!/bin/bash

module load SQLite --latest
node parallel-export-variant.js raw/melanoma.csv
