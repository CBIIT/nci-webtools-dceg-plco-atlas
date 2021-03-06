START TRANSACTION;

SET autocommit = 0;

CREATE TEMPORARY TABLE `pca_stage`  (
    `plco_id` varchar(100),
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
    `pc20` double,
    `rel_unrel` varchar(20),
    `platform` varchar(20)
);

LOAD DATA LOCAL INFILE "../raw/pca.tsv" INTO TABLE pca_stage
    FIELDS TERMINATED BY '\t' OPTIONALLY ENCLOSED BY '"'
    IGNORE 1 ROWS;

TRUNCATE TABLE principal_component_analysis;

INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 1, ps.pc1, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 2, ps.pc2, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 3, ps.pc3, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 4, ps.pc4, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 5, ps.pc5, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 6, ps.pc6, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 7, ps.pc7, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 8, ps.pc8, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 9, ps.pc9, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 10, ps.pc10, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 11, ps.pc11, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;

INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 12, ps.pc12, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 13, ps.pc13, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 14, ps.pc14, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 15, ps.pc15, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 16, ps.pc16, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 17, ps.pc17, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 18, ps.pc18, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 19, ps.pc19, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;


INSERT INTO principal_component_analysis (participant_id, principal_component, value, platform)
SELECT p.id, 20, ps.pc20, ps.platform
FROM pca_stage ps
JOIN participant p on ps.plco_id = p.plco_id;

COMMIT;