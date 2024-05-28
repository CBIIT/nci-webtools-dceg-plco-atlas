START TRANSACTION;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

-- disable only_full_group_by
SET sql_mode = '';

-- load data into study table
LOAD DATA LOCAL INFILE "study.txt" INTO TABLE study
    FIELDS TERMINATED BY ',' ENCLOSED BY '"'
    IGNORE 1 ROWS
    (
      id,
      pubmed_id,
      display_name,
      description
    );
COMMIT;