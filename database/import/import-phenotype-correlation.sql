START TRANSACTION;

-- FLUSH TABLES;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

SET autocommit = 0;

TRUNCATE TABLE phenotype_correlation;

LOAD DATA LOCAL INFILE "../raw/phenotype_correlation.csv" INTO TABLE phenotype_correlation
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
    IGNORE 1 ROWS (phenotype_a, phenotype_b, value);

COMMIT;