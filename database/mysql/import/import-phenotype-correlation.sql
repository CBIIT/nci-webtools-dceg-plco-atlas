START TRANSACTION;

-- FLUSH TABLES;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

SET autocommit = 0;

DROP TABLE IF EXISTS phenotype_correlation;
CREATE TABLE `phenotype_correlation` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_a`   INTEGER NOT NULL,
    `phenotype_b`   INTEGER NOT NULL,
    `value`         DOUBLE NOT NULL,
    FOREIGN KEY (phenotype_a) REFERENCES phenotype(id),
    FOREIGN KEY (phenotype_b) REFERENCES phenotype(id)
);

-- D:/Development/Work/nci-webtools-dceg-plco-atlas/database/mysql/import/raw/participant_data_category.csv
LOAD DATA LOCAL INFILE "D:/Development/Work/nci-webtools-dceg-plco-atlas/database/mysql/import/raw/phenotype_correlation.csv" INTO TABLE phenotype_correlation
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
    IGNORE 1 ROWS (phenotype_a, phenotype_b, value);


COMMIT;