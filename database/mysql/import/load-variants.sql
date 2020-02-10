-- This file is a template
-- Replace the following variables to load variants
--   __TABLE_PREFIX__
--   __FILEPATH__
--   __GENDER__

-- After loading, we should run load-variants.js -- phenotype __PHENOTYPE_ID__ --gender __GENDER__

START TRANSACTION;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

SET autocommit = 0;

-- create tables if needed
CREATE TABLE IF NOT EXISTS __TABLE_PREFIX___variant (
    `id`                BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`            ENUM('all', 'female', 'male') NOT NULL,
    `chromosome`        VARCHAR(2) NOT NULL,
    `position`          BIGINT NOT NULL,
    `snp`               VARCHAR(200) NOT NULL,
    `allele_reference`  VARCHAR(200),
    `allele_effect`     VARCHAR(200),
    `p_value`           DOUBLE,
    `p_value_nlog`      DOUBLE, -- negative log10(P)
    `p_value_r`         DOUBLE,
    `odds_ratio`        DOUBLE,
    `odds_ratio_r`      DOUBLE,
    `n`                 BIGINT,
    `q`                 DOUBLE,
    `i`                 DOUBLE,
    `show_qq_plot`      BOOLEAN
) ENGINE=MYISAM;

-- Phenotype name is used as prefix
-- eg: melanoma_aggregate
CREATE TABLE IF NOT EXISTS __TABLE__PREFIX___aggregate (
    `id`            BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`        ENUM('all', 'female', 'male') NOT NULL,
    `position_abs`  BIGINT NOT NULL,
    `p_value_nlog`  DOUBLE NOT NULL
) ENGINE=MYISAM;

-- create staging table
CREATE TEMPORARY TABLE stage (
    chromosome              VARCHAR(2),
    position                BIGINT,
    position_abs_aggregate  BIGINT,
    snp                     VARCHAR(200),
    allele_reference        VARCHAR(200),
    allele_effect           VARCHAR(200),
    p_value                 DOUBLE,
    p_value_nlog            DOUBLE, -- negative log10(P)
    p_value_nlog_aggregate  DOUBLE,
    p_value_r               DOUBLE,
    odds_ratio              DOUBLE,
    odds_ratio_r            DOUBLE,
    n                       BIGINT,
    q                       DOUBLE,
    i                       DOUBLE
) ENGINE=MYISAM;

LOAD DATA LOCAL INFILE __FILEPATH__
INTO TABLE stage
FIELDS TERMINATED BY ','
IGNORE 1 LINES
(@chromosome, @position, snp, allele_reference, allele_effect, @p_value, p_value_r, odds_ratio, odds_ratio_r, n, q, i)
SET chromosome = @chromosome,
    position = @position,
    p_value = @p_value,
    p_value_nlog = -LOG10(@p_value),
    p_value_nlog_aggregate = 1e-2 * FLOOR(1e2 * -LOG10(@p_value)),
    position_abs_aggregate = 1e6 * FLOOR(1e-6 * (SELECT @position + position_abs_min FROM chromosome_range cr WHERE cr.chromosome = @chromosome))

INSERT INTO __TABLE__PREFIX___variant (
    gender,
    chromosome,
    position,
    snp,
    allele_reference,
    allele_effect,
    p_value,
    p_value_nlog,
    p_value_r,
    odds_ratio,
    odds_ratio_r,
    n,
    q,
    i,
    show_qq_plot
) SELECT
    "__GENDER__",
    chromosome,
    position,
    snp,
    allele_reference,
    allele_effect,
    p_value,
    p_value_nlog,
    p_value_r,
    odds_ratio,
    odds_ratio_r,
    n,
    q,
    i,
    0
FROM stage
WHERE p_value BETWEEN 0 AND 1 AND chromosome IS NOT NULL
ORDER BY chromosome ASC, p_value_nlog DESC;


INSERT INTO __TABLE__PREFIX___aggregate
    (gender, position_abs, p_value_nlog)
SELECT DISTINCT
    "__GENDER__",
    position_abs_aggregate as position_abs,
    p_value_nlog_aggregate as p_value_nlog
FROM stage
WHERE p_value BETWEEN 0 AND 1 AND chromosome IS NOT NULL;

-- enable indexes
ALTER TABLE __TABLE__PREFIX___variant
    ADD INDEX idx___TABLE__PREFIX___variant__gender        (gender),
    ADD INDEX idx___TABLE__PREFIX___variant__chromosome    (chromosome),
    ADD INDEX idx___TABLE__PREFIX___variant__position      (position),
    ADD INDEX idx___TABLE__PREFIX___variant__p_value_nlog  (p_value_nlog),
    ADD INDEX idx___TABLE__PREFIX___variant__snp           (snp),
    ADD INDEX idx___TABLE__PREFIX___variant__show_qq_plot  (show_qq_plot);

-- aggregated variants table
ALTER TABLE __TABLE__PREFIX___aggregate
    ADD INDEX idx___TABLE__PREFIX___aggregate__gender          (gender),
    ADD INDEX idx___TABLE__PREFIX___aggregate__position_abs    (position_abs),
    ADD INDEX idx___TABLE__PREFIX___aggregate__p_value_nlog    (p_value_nlog);

COMMIT;