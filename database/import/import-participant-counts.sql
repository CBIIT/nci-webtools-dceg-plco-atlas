START TRANSACTION;

FLUSH TABLES;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

SET autocommit = 0;

CREATE TEMPORARY TABLE participant_counts_stage (
    `phenotype_name` TEXT,
    `phenotype_id` INTEGER,
    `ancestry` TEXT,
    `sex` TEXT,
    `participant_count_case` INTEGER,
    `participant_count_control` INTEGER
);

LOAD DATA LOCAL INFILE "../raw/participant_counts.tsv" INTO TABLE participant_counts_stage
    FIELDS TERMINATED BY '\t' OPTIONALLY ENCLOSED BY '"'
    IGNORE 1 ROWS (@phenotype_name, @ancestry, @sex, @cases, @controls)
    SET 
        phenotype_name = @phenotype_name,
        phenotype_id = (SELECT id from phenotype where name = @phenotype_name),
        ancestry = lower(@ancestry),
        sex =  lower(@sex),
        participant_count_case = @cases,
        participant_count_control = @controls;

INSERT INTO phenotype_metadata (phenotype_id, sex, ancestry, chromosome, participant_count_case, participant_count_control)
SELECT 
    phenotype_id, 
    sex, 
    ancestry, 
    "all" AS chromosome, 
    participant_count_case,
    participant_count_control
FROM participant_counts_stage
ON DUPLICATE KEY UPDATE
    participant_count_case = VALUES(participant_count_case),
    participant_count_control = VALUES(participant_count_control);

COMMIT;