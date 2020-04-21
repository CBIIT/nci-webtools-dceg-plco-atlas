# shuffles databases when importing
set -ex

# import into ewing's sarcoma, renal cell carcinoma (female), melanoma (male)
time node import-variant.js --file raw/ewings_sarcoma.csv --phenotype test_ewings_sarcoma --sex all --create
time node import-variant.js --file raw/renal_cell_carcinoma.csv --phenotype test_ewings_sarcoma --sex female
time node import-variant.js --file raw/melanoma.csv --phenotype test_ewings_sarcoma --sex male

# import into melanoma, renal cell carcinoma (female), ewing's sarcoma (male)
time node import-variant.js --file raw/melanoma.csv --phenotype test_melanoma --sex all --create
time node import-variant.js --file raw/renal_cell_carcinoma.csv --phenotype test_melanoma --sex female
time node import-variant.js --file raw/ewings_sarcoma.csv --phenotype test_melanoma --sex male

# import into renal cell carcinoma, ewing's sarcoma (female), melanoma (male)
time node import-variant.js --file raw/renal_cell_carcinoma.csv --phenotype test_renal_cell_carcinoma --sex all --create
time node import-variant.js --file raw/ewings_sarcoma.csv --phenotype test_renal_cell_carcinoma --sex female
time node import-variant.js --file raw/melanoma.csv --phenotype test_renal_cell_carcinoma --sex male