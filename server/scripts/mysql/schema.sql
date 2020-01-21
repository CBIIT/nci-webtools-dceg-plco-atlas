-- DROP TABLE `phenotype_correlation`;
-- DROP TABLE `phenotype_metadata`;
-- DROP TABLE `lu_phenotype`;
-- DROP TABLE `variant`;
-- DROP TABLE `aggregate`;
-- DROP TABLE `gene`;

CREATE TABLE `lu_phenotype` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(200) NOT NULL,
    `display_name`  VARCHAR(200) NOT NULL,
    `parent_id`     INTEGER NULL,
    FOREIGN KEY (parent_id) REFERENCES lu_phenotype(id)
);

CREATE TABLE `phenotype_correlation` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_a`   INTEGER NOT NULL,
    `phenotype_b`   INTEGER NOT NULL,
    `value`         DOUBLE NOT NULL,
    FOREIGN KEY (phenotype_a) REFERENCES lu_phenotype(id),
    FOREIGN KEY (phenotype_b) REFERENCES lu_phenotype(id)
);

CREATE TABLE `phenotype_metadata` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id`  INTEGER,
    `gender`        ENUM('all', 'female', 'male'),
    `lambda_gc`     DOUBLE,
    `other`         VARCHAR(2000),
    FOREIGN KEY (phenotype_id) REFERENCES lu_phenotype(id)
);

-- Phenotype name is used as prefix
-- eg: melanoma_variant
CREATE TABLE `variant` (
    `id`                BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`            ENUM('all', 'female', 'male') NOT NULL,
    `chromosome`        VARCHAR(2) NOT NULL,
    `position`          BIGINT NOT NULL,
    `snp`               VARCHAR(200) NOT NULL,
    `reference_allele`  VARCHAR(200),
    `effect_allele`     VARCHAR(200),
    `n`                 BIGINT,
    `p`                 DOUBLE,
    `p_expected`        DOUBLE,
    `p_nlog`            DOUBLE, -- negative log10(P)
    `odds_ratio`        DOUBLE,
    `q`                 DOUBLE,
    `i`                 DOUBLE,
    `show_qq_plot`      BOOLEAN
);

        // const [snp, chr, loc, group, category, info, num_control, num_case, reference_allele, effect_allele, effect_allele_freq_control, effect_allele_freq_case, or, ci, p, phet, i2] = values;


-- Phenotype name is used as prefix
-- eg: melanoma_aggregate
CREATE TABLE `aggregate` (
    `id`            BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`        ENUM('all', 'female', 'male') NOT NULL,
    `position_abs`  BIGINT NOT NULL,
    `p_nlog`        DOUBLE NOT NULL
);

CREATE TABLE `gene` (
    `id`                    INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(200) NOT NULL,
    `chromosome`            VARCHAR(2) NOT NULL,
    `strand`                CHAR NOT NULL,
    `transcription_start`   INTEGER NOT NULL,
    `transcription_end`     INTEGER NOT NULL,
    `exon_starts`           MEDIUMTEXT,
    `exon_ends`             MEDIUMTEXT
);

