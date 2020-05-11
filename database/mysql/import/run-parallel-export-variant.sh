#!/bin/bash

sbatch --time=12:00:00 --cpus-per-task=2 scripts/import-ewings-sarcoma.sh
sbatch --time=12:00:00 --cpus-per-task=2 scripts/import-melanoma.sh
sbatch --time=12:00:00 --cpus-per-task=2 scripts/import-renal-cell-carcinoma.sh
