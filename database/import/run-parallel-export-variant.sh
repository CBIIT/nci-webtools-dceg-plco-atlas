#!/bin/bash

sbatch --time=12:00:00 --cpus-per-task=2 scripts/export-ewings-sarcoma.sh
sbatch --time=12:00:00 --cpus-per-task=2 scripts/export-melanoma.sh
sbatch --time=12:00:00 --cpus-per-task=2 scripts/export-renal-cell-carcinoma.sh
