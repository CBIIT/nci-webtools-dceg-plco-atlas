START TRANSACTION;

-- FLUSH TABLES;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

SET autocommit = 0;

CREATE TEMPORARY TABLE `phenotype_metadata_lambda_gc_ld_score` (
    `phenotype_id` integer,
    `sex` varchar(200),
    `ancestry` varchar(200),
    `score` double
);

LOAD DATA LOCAL INFILE "../raw/ldscore.tsv" INTO TABLE lambdagc_stage
    FIELDS TERMINATED BY '\t' OPTIONALLY ENCLOSED BY '"'
    IGNORE 1 ROWS (@phenotype, @ancestry, @score)
    SET 
        phenotype_id = (SELECT id from phenotype where name = REGEXP_REPLACE(@phenotype, '_(fe)?male$', '')),
        sex =  if(
            REGEXP_LIKE(@phenotype, '_(fe)?male$'),
            REGEXP_SUBSTR(@phenotype, '(fe)?male$'),
            'all'
        ),
        ancestry = lower(@ancestry),
        score = @score;

update phenotype_metadata pm
inner join phenotype_metadata_lambda_gc_ld_score pmlgls on
    pm.phenotype_id = pmlgls.phenotype_id and
    pm.sex = pmlgls.sex and
    pm.ancestry = pmlgls.ancestry and
    pm.chromosome = 'all'
set pm.lambda_gc_ld_score = pmlgls.score;

COMMIT;