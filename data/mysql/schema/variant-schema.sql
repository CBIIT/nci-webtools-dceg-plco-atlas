-- Phenotype name is used as prefix
-- eg: melanoma_stage
CREATE TABLE `$PHENOTYPE_stage` (
    `id`                BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`            ENUM('all', 'female', 'male') NOT NULL,
    `chromosome`        VARCHAR(2) NOT NULL,
    `position`          BIGINT NOT NULL,
    `position_aggregate`        BIGINT NOT NULL,
    `position_abs_aggregate`    BIGINT NOT NULL,
    `snp`               VARCHAR(200) NOT NULL,
    `allele_reference`  VARCHAR(200),
    `allele_effect`     VARCHAR(200),
    `p_value`           DOUBLE,
    `p_value_aggregate` DOUBLE,
    `p_value_expected`  DOUBLE,
    `p_value_nlog`      DOUBLE, -- negative log10(P)
    `p_value_r`,        DOUBLE,
    `odds_ratio`        DOUBLE,
    `odds_ratio_r`      DOUBLE,
    `n`                 BIGINT,
    `q`                 DOUBLE,
    `i`                 DOUBLE,
    `show_qq_plot`      BOOLEAN
);

-- Phenotype name is used as prefix
-- eg: melanoma_variant
CREATE TABLE `$PHENOTYPE_variant` (
    `id`                BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`            ENUM('all', 'female', 'male') NOT NULL,
    `chromosome`        VARCHAR(2) NOT NULL,
    `position`          BIGINT NOT NULL,
    `snp`               VARCHAR(200) NOT NULL,
    `allele_reference`  VARCHAR(200),
    `allele_effect`     VARCHAR(200),
    `p_value`           DOUBLE,
    `p_value_expected`  DOUBLE,
    `p_value_nlog`      DOUBLE, -- negative log10(P)
    `p_value_r`,        DOUBLE,
    `odds_ratio`        DOUBLE,
    `odds_ratio_r`      DOUBLE,
    `n`                 BIGINT,
    `q`                 DOUBLE,
    `i`                 DOUBLE,
    `show_qq_plot`      BOOLEAN,
    INDEX (gender),
    INDEX (chromosome),
    INDEX (position),
    INDEX (p_value_nlog),
    INDEX (snp),
    INDEX (show_qq_plot)
);

-- Phenotype name is used as prefix
-- eg: melanoma_aggregate
CREATE TABLE `$PHENOTYPE_aggregate` (
    `id`            BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`        ENUM('all', 'female', 'male') NOT NULL,
    `position_abs`  BIGINT NOT NULL,
    `p_value_nlog`  DOUBLE NOT NULL,
    INDEX (gender),
    INDEX (position_abs),
    INDEX (p_value_nlog)
);