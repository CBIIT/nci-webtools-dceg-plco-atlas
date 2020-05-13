#!/bin/bash

sbatch --time=12:00:00 --cpus-per-task=2 export-ewings-sarcoma.sh
sbatch --time=12:00:00 --cpus-per-task=2 export-melanoma.sh
sbatch --time=12:00:00 --cpus-per-task=2 export-renal-cell-carcinoma.sh
