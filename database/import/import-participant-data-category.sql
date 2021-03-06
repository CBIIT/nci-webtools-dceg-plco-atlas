START TRANSACTION;

FLUSH TABLES;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

SET autocommit = 0;

CREATE TEMPORARY TABLE participant_data_category_stage (
    `phenotype_name`        TEXT,
    `value`                 TEXT,
    `label`                 TEXT,
    `show_distribution`     TEXT,
    `order`                 TEXT
);

LOAD DATA LOCAL INFILE "../raw/participant_data_category.csv" INTO TABLE participant_data_category_stage
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
    IGNORE 1 ROWS (`phenotype_name`, `value`, `label`, `show_distribution`, `order`, @undefined);

TRUNCATE TABLE participant_data_category;
INSERT INTO participant_data_category (`phenotype_id`, `value`, `label`, `show_distribution`, `order`)
SELECT
       p.id,
       stage.value,
       stage.label,
       IF(stage.show_distribution REGEXP 'TRUE', 1, 0),
       stage.order
FROM participant_data_category_stage stage
INNER JOIN phenotype p ON p.name = stage.phenotype_name
ORDER BY p.id, stage.value;

COMMIT;