START TRANSACTION;

FLUSH TABLES;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

SET autocommit = 0;


DROP TABLE IF EXISTS participant_data_category;
DROP TABLE IF EXISTS participant_data_category_stage;

CREATE TABLE participant_data_category_stage (
    `phenotype_name`        TEXT,
    `value`                 TEXT,
    `label`                 TEXT,
    `show_distribution`     TEXT,
    `order`                 TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `participant_data_category` (
    `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id` INTEGER NOT NULL,
    `value` DOUBLE,
    `label` TEXT,
    `show_distribution` BOOLEAN,
    `order` INTEGER,
    FOREIGN KEY (phenotype_id) REFERENCES phenotype(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- D:/Development/Work/nci-webtools-dceg-plco-atlas/database/import/raw/participant_data_category.csv
LOAD DATA LOCAL INFILE "../raw/participant_data_category.csv" INTO TABLE participant_data_category_stage
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
    IGNORE 1 ROWS (`phenotype_name`, `value`, `label`, `show_distribution`, `order`, @undefined);

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