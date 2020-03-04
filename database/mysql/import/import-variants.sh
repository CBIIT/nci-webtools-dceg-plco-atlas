# shuffles databases when importing
set -ex

# import into ewing's sarcoma, renal cell carcinoma (female), melanoma (male)
time node import-variants-full.js --file raw/ewings_sarcoma.csv --phenotype 2 --gender all --reset
time node import-variants-full.js --file raw/renal_cell_carcinoma.csv --phenotype 2 --gender female
time node import-variants-full.js --file raw/melanoma.csv --phenotype 2 --gender male --index

# import into melanoma, renal cell carcinoma (female), ewing's sarcoma (male)
time node import-variants-full.js --file raw/melanoma.csv --phenotype 3 --gender all --reset
time node import-variants-full.js --file raw/renal_cell_carcinoma.csv --phenotype 3 --gender female
time node import-variants-full.js --file raw/ewings_sarcoma.csv --phenotype 3 --gender male --index

# import into renal cell carcinoma, ewing's sarcoma (female), melanoma (male)
time node import-variants-full.js --file raw/renal_cell_carcinoma.csv --phenotype 4 --gender all --reset
time node import-variants-full.js --file raw/ewings_sarcoma.csv --phenotype 4 --gender female
time node import-variants-full.js --file raw/melanoma.csv --phenotype 4 --gender male --index