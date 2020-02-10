
node import-variants-full.js --file raw\\ewings_sarcoma.csv --phenotype 2 --gender all --reset
node import-variants-full.js --file raw\\renal_cell_carcinoma.csv --phenotype 2 --gender female
node import-variants-full.js --file raw\\melanoma.csv --phenotype 2 --gender male

node import-variants-full.js --file raw\\melanoma.csv --phenotype 3 --gender all --reset
node import-variants-full.js --file raw\\renal_cell_carcinoma.csv --phenotype 3 --gender female
node import-variants-full.js --file raw\\ewings_sarcoma.csv --phenotype 3 --gender male

node import-variants-full.js --file raw\\renal_cell_carcinoma.csv --phenotype 4 --gender all --reset
node import-variants-full.js --file raw\\ewings_sarcoma.csv --phenotype 4 --gender female
node import-variants-full.js --file raw\\melanoma.csv --phenotype 4 --gender male