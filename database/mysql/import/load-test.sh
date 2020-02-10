# shuffles databases when importing

# import into ewing's sarcoma, renal cell carcinoma (female), melanoma (male)
sed \
    -e 's/__TABLE_PREFIX__/ewings_sarcoma_2/g' \
    -e 's/__FILEPATH__/raw\/ewings_sarcoma.csv/g' \
    -e 's/__GENDER__/all/g' \
    load-variants.sql | mysql --host $PLCO_HOST --port $PLCO_PORT  --user $PLCO_USER --password $PLCO_PASSWORD --database $PLCO_DATABASE
node import-variants.js --phenotype 2 --gender all

sed \
    -e 's/__TABLE_PREFIX__/renal_cell_carcinoma_2/g' \
    -e 's/__FILEPATH__/raw\/renal_cell_carcinoma.csv/g' \
    -e 's/__GENDER__/female/g' \
    load-variants.sql | mysql --host $PLCO_HOST --port $PLCO_PORT  --user $PLCO_USER --password $PLCO_PASSWORD --database $PLCO_DATABASE
node import-variants.js --phenotype 2 --gender female

sed \
    -e 's/__TABLE_PREFIX__/melanoma_2/g' \
    -e 's/__FILEPATH__/raw\/melanoma.csv/g' \
    -e 's/__GENDER__/male/g' \
    load-variants.sql | mysql --host $PLCO_HOST --port $PLCO_PORT  --user $PLCO_USER --password $PLCO_PASSWORD --database $PLCO_DATABASE
node import-variants.js --phenotype 2 --gender male



# import into melanoma, renal cell carcinoma (female), ewing's sarcoma (male)
sed \
    -e 's/__TABLE_PREFIX__/melanoma_3/g' \
    -e 's/__FILEPATH__/raw\/melanoma.csv/g' \
    -e 's/__GENDER__/all/g' \
    load-variants.sql | mysql --host $PLCO_HOST --port $PLCO_PORT  --user $PLCO_USER --password $PLCO_PASSWORD --database $PLCO_DATABASE
node import-variants.js --phenotype 3 --gender all

sed \
    -e 's/__TABLE_PREFIX__/renal_cell_carcinoma_3/g' \
    -e 's/__FILEPATH__/raw\/renal_cell_carcinoma.csv/g' \
    -e 's/__GENDER__/female/g' \
    load-variants.sql | mysql --host $PLCO_HOST --port $PLCO_PORT  --user $PLCO_USER --password $PLCO_PASSWORD --database $PLCO_DATABASE
node import-variants.js --phenotype 3 --gender female

sed \
    -e 's/__TABLE_PREFIX__/ewings_sarcoma_3/g' \
    -e 's/__FILEPATH__/raw\/ewings_sarcoma.csv/g' \
    -e 's/__GENDER__/male/g' \
    load-variants.sql | mysql --host $PLCO_HOST --port $PLCO_PORT  --user $PLCO_USER --password $PLCO_PASSWORD --database $PLCO_DATABASE
node import-variants.js --phenotype 3 --gender male



# import into renal cell carcinoma, ewing's sarcoma (female), melanoma (male)
sed \
    -e 's/__TABLE_PREFIX__/renal_cell_carcinoma_4/g' \
    -e 's/__FILEPATH__/raw\/renal_cell_carcinoma.csv/g' \
    -e 's/__GENDER__/all/g' \
    load-variants.sql | mysql --host $PLCO_HOST --port $PLCO_PORT  --user $PLCO_USER --password $PLCO_PASSWORD --database $PLCO_DATABASE
node import-variants.js --phenotype 4 --gender all

sed \
    -e 's/__TABLE_PREFIX__/ewings_sarcoma_4/g' \
    -e 's/__FILEPATH__/raw\/ewings_sarcoma.csv/g' \
    -e 's/__GENDER__/female/g' \
    load-variants.sql | mysql --host $PLCO_HOST --port $PLCO_PORT  --user $PLCO_USER --password $PLCO_PASSWORD --database $PLCO_DATABASE
node import-variants.js --phenotype 4 --gender female

sed \
    -e 's/__TABLE_PREFIX__/melanoma_4/g' \
    -e 's/__FILEPATH__/raw\/melanoma.csv/g' \
    -e 's/__GENDER__/male/g' \
    load-variants.sql | mysql --host $PLCO_HOST --port $PLCO_PORT  --user $PLCO_USER --password $PLCO_PASSWORD --database $PLCO_DATABASE
node import-variants.js --phenotype 4 --gender male