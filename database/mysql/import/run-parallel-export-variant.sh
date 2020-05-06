#!/bin/bash

sbatch --cpus-per-task=2 scripts/import-ewings-sarcoma.sh
sbatch --cpus-per-task=2 scripts/import-melanoma.sh
sbatch --cpus-per-task=2 scripts/import-renal-cell-carcinoma.sh
