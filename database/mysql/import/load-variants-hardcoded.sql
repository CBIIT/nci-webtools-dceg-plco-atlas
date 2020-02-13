START TRANSACTION;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

SET autocommit = 0;

--
DROP TABLE IF EXISTS ewings_sarcoma_2_stage;
DROP TABLE IF EXISTS ewings_sarcoma_2_variant;
DROP TABLE IF EXISTS ewings_sarcoma_2_aggregate;

DROP TABLE IF EXISTS melanoma_3_stage;
DROP TABLE IF EXISTS melanoma_3_variant;
DROP TABLE IF EXISTS melanoma_3_aggregate;

DROP TABLE IF EXISTS renal_cell_carcinoma_4_stage;
DROP TABLE IF EXISTS renal_cell_carcinoma_4_variant;
DROP TABLE IF EXISTS renal_cell_carcinoma_4_aggregate;


-- create stage tables
CREATE TABLE ewings_sarcoma_2_stage (
    `chromosome`              VARCHAR(2),
    `position`                BIGINT,
    `position_abs_aggregate`  BIGINT,
    `snp`                     VARCHAR(200),
    `allele_reference`        VARCHAR(200),
    `allele_effect`           VARCHAR(200),
    `p_value`                 DOUBLE,
    `p_value_nlog`            DOUBLE, -- negative log10(P)
    `p_value_nlog_aggregate`  DOUBLE,
    `p_value_r`               DOUBLE,
    `odds_ratio`              DOUBLE,
    `odds_ratio_r`            DOUBLE,
    `n`                       BIGINT,
    `q`                       DOUBLE,
    `i`                       DOUBLE
) ENGINE=MYISAM;

CREATE TABLE melanoma_3_stage (
    `chromosome`              VARCHAR(2),
    `position`                BIGINT,
    `position_abs_aggregate`  BIGINT,
    `snp`                     VARCHAR(200),
    `allele_reference`        VARCHAR(200),
    `allele_effect`           VARCHAR(200),
    `p_value`                 DOUBLE,
    `p_value_nlog`            DOUBLE, -- negative log10(P)
    `p_value_nlog_aggregate`  DOUBLE,
    `p_value_r`               DOUBLE,
    `odds_ratio`              DOUBLE,
    `odds_ratio_r`            DOUBLE,
    `n`                       BIGINT,
    `q`                       DOUBLE,
    `i`                       DOUBLE
) ENGINE=MYISAM;

CREATE TABLE renal_cell_carcinoma_4_stage (
    `chromosome`              VARCHAR(2),
    `position`                BIGINT,
    `position_abs_aggregate`  BIGINT,
    `snp`                     VARCHAR(200),
    `allele_reference`        VARCHAR(200),
    `allele_effect`           VARCHAR(200),
    `p_value`                 DOUBLE,
    `p_value_nlog`            DOUBLE, -- negative log10(P)
    `p_value_nlog_aggregate`  DOUBLE,
    `p_value_r`               DOUBLE,
    `odds_ratio`              DOUBLE,
    `odds_ratio_r`            DOUBLE,
    `n`                       BIGINT,
    `q`                       DOUBLE,
    `i`                       DOUBLE
) ENGINE=MYISAM;


-- create variant tables
CREATE TABLE ewings_sarcoma_2_variant (
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

CREATE TABLE melanoma_3_variant (
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

CREATE TABLE renal_cell_carcinoma_4_variant (
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


-- create aggregate tables
CREATE TABLE ewings_sarcoma_2_aggregate (
    `id`            BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`        ENUM('all', 'female', 'male') NOT NULL,
    `position_abs`  BIGINT NOT NULL,
    `p_value_nlog`  DOUBLE NOT NULL
);

CREATE TABLE melanoma_3_aggregate (
    `id`            BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`        ENUM('all', 'female', 'male') NOT NULL,
    `position_abs`  BIGINT NOT NULL,
    `p_value_nlog`  DOUBLE NOT NULL
);

CREATE TABLE renal_cell_carcinoma_4_aggregate (
    `id`            BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`        ENUM('all', 'female', 'male') NOT NULL,
    `position_abs`  BIGINT NOT NULL,
    `p_value_nlog`  DOUBLE NOT NULL
);


-- load data into ewings_sarcoma_2_stage
LOAD DATA LOCAL INFILE "raw/ewings_sarcoma.csv"
INTO TABLE ewings_sarcoma_2_stage
FIELDS TERMINATED BY ','
IGNORE 1 LINES
(@chromosome, @position, snp, allele_reference, allele_effect, @p_value, p_value_r, odds_ratio, odds_ratio_r, n, q, i)
SET chromosome = @chromosome,
    position = @position,
    p_value = @p_value,
    p_value_nlog = -LOG10(@p_value),
    p_value_nlog_aggregate = 1e-2 * FLOOR(1e2 * -LOG10(@p_value)),
    position_abs_aggregate = 1e6 * FLOOR(1e-6 * (SELECT @position + position_abs_min FROM chromosome_range cr WHERE cr.chromosome = @chromosome));


-- load data into melanoma_3_stage
LOAD DATA LOCAL INFILE "raw/melanoma.csv"
INTO TABLE melanoma_3_stage
FIELDS TERMINATED BY ','
IGNORE 1 LINES
(@chromosome, @position, snp, allele_reference, allele_effect, @p_value, p_value_r, odds_ratio, odds_ratio_r, n, q, i)
SET chromosome = @chromosome,
    position = @position,
    p_value = @p_value,
    p_value_nlog = -LOG10(@p_value),
    p_value_nlog_aggregate = 1e-2 * FLOOR(1e2 * -LOG10(@p_value)),
    position_abs_aggregate = 1e6 * FLOOR(1e-6 * (SELECT @position + position_abs_min FROM chromosome_range cr WHERE cr.chromosome = @chromosome));

-- load data into renal_cell_carcinoma_4_stage
LOAD DATA LOCAL INFILE "raw/renal_cell_carcinoma.csv"
INTO TABLE renal_cell_carcinoma_4_stage
FIELDS TERMINATED BY ','
IGNORE 1 LINES
(@chromosome, @position, snp, allele_reference, allele_effect, @p_value, p_value_r, odds_ratio, odds_ratio_r, n, q, i)
SET chromosome = @chromosome,
    position = @position,
    p_value = @p_value,
    p_value_nlog = -LOG10(@p_value),
    p_value_nlog_aggregate = 1e-2 * FLOOR(1e2 * -LOG10(@p_value)),
    position_abs_aggregate = 1e6 * FLOOR(1e-6 * (SELECT @position + position_abs_min FROM chromosome_range cr WHERE cr.chromosome = @chromosome));


-- create indexes on staging tables
alter table ewings_sarcoma_2_stage
    add index (p_value),
    add index (chromosome);

alter table melanoma_3_stage
    add index (p_value),
    add index (chromosome);

alter table renal_cell_carcinoma_4_stage
    add index (p_value),
    add index (chromosome);


-- insert variants into ewings_sarcoma_2 tables
-- all (ewings_sarcoma)
INSERT INTO ewings_sarcoma_2_variant (
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
    "all",
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
FROM ewings_sarcoma_2_stage
WHERE p_value BETWEEN 0 AND 1 AND chromosome IS NOT NULL
ORDER BY chromosome ASC, p_value ASC;

-- female (renal_cell_carcinoma)
INSERT INTO ewings_sarcoma_2_variant (
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
    "female",
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
FROM renal_cell_carcinoma_4_stage
WHERE p_value BETWEEN 0 AND 1 AND chromosome IS NOT NULL
ORDER BY chromosome ASC, p_value ASC;

-- male (melanoma)
INSERT INTO ewings_sarcoma_2_variant (
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
    "male",
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
FROM melanoma_3_stage
WHERE p_value BETWEEN 0 AND 1 AND chromosome IS NOT NULL
ORDER BY chromosome ASC, p_value ASC;


-- insert aggregated variants for ewings_sarcoma

-- all (ewings_sarcoma)
INSERT INTO ewings_sarcoma_2_aggregate
    (gender, position_abs, p_value_nlog)
SELECT DISTINCT
    "all",
    position_abs_aggregate as position_abs,
    p_value_nlog_aggregate as p_value_nlog
FROM ewings_sarcoma_2_stage
WHERE p_value BETWEEN 0 AND 1 AND chromosome IS NOT NULL;

-- female (renal_cell_carcinoma)
INSERT INTO ewings_sarcoma_2_aggregate
    (gender, position_abs, p_value_nlog)
SELECT DISTINCT
    "female",
    position_abs_aggregate as position_abs,
    p_value_nlog_aggregate as p_value_nlog
FROM renal_cell_carcinoma_4_stage
WHERE p_value BETWEEN 0 AND 1 AND chromosome IS NOT NULL;

-- male (melanoma)
INSERT INTO ewings_sarcoma_2_aggregate
    (gender, position_abs, p_value_nlog)
SELECT DISTINCT
    "male",
    position_abs_aggregate as position_abs,
    p_value_nlog_aggregate as p_value_nlog
FROM melanoma_3_stage
WHERE p_value BETWEEN 0 AND 1 AND chromosome IS NOT NULL;


-- index ewings_sarcoma tables
ALTER TABLE ewings_sarcoma_2_variant
    ADD INDEX (gender),
    ADD INDEX (chromosome),
    ADD INDEX (position),
    ADD INDEX (p_value),
    ADD INDEX (p_value_nlog),
    ADD INDEX (snp),
    ADD INDEX (show_qq_plot);

ALTER TABLE ewings_sarcoma_2_aggregate
    ADD INDEX (gender),
    ADD INDEX (chromosome),
    ADD INDEX (position),
    ADD INDEX (p_value),
    ADD INDEX (p_value_nlog),
    ADD INDEX (snp),
    ADD INDEX (show_qq_plot);

ALTER TABLE ewings_sarcoma_2_aggregate
    ADD INDEX (gender),
    ADD INDEX (position_abs),
    ADD INDEX (p_value_nlog);

-- EWINGS_SARCOMA FINISHES IMPORTING


-- BEGIN IMPORTING MELANOMA


-- MELANOMA FINISHES IMPORTING



-- BEGIN IMPORTING RCC


-- RCC FINISHES IMPORTING