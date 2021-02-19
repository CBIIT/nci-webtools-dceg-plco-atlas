START TRANSACTION;

-- FLUSH TABLES;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

SET autocommit = 0;

CREATE TABLE `pca_stage` (
    `plco_id` varchar(200),
    `pc1` double,
    `pc2` double,
    `pc3` double,
    `pc4` double,
    `pc5` double,
    `pc6` double,
    `pc7` double,
    `pc8` double,
    `pc9` double,
    `pc10` double,
    `pc11` double,
    `pc12` double,
    `pc13` double,
    `pc14` double,
    `pc15` double,
    `pc16` double,
    `pc17` double,
    `pc18` double,
    `pc19` double,
    `pc20` double
);

LOAD DATA LOCAL INFILE "../raw/pca.tsv" INTO TABLE pca_stage
    FIELDS TERMINATED BY '\t' OPTIONALLY ENCLOSED BY '"'
    IGNORE 1 ROWS;

INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 1, ps.pc1
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 2, ps.pc2
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 3, ps.pc3
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 4, ps.pc4
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 5, ps.pc5
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 6, ps.pc6
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 7, ps.pc7
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 8, ps.pc8
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 9, ps.pc9
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 10, ps.pc10
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 11, ps.pc11
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;

INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 12, ps.pc12
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 13, ps.pc13
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 14, ps.pc14
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 15, ps.pc15
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 16, ps.pc16
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 17, ps.pc17
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 18, ps.pc18
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 19, ps.pc19
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis pca (participant_id, principal_component, value)
SELECT p.id, 20, ps.pc20
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;

COMMIT;