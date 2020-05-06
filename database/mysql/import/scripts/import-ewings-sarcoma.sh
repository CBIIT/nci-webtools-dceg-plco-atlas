#!/bin/bash

module load SQLite --latest
node parallel-export-variant.js raw/ewings_sarcoma.csv
