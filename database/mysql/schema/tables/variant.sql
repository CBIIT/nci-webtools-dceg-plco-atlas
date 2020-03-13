-- Phenotype name is used as prefix
-- eg: melanoma_variant
CREATE TABLE IF NOT EXISTS `variant_$PHENOTYPE` (
    `id`                    BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`                ENUM('all', 'female', 'male') NOT NULL,
    `chromosome`            VARCHAR(2) NOT NULL,
    `position`              BIGINT NOT NULL,
    `snp`                   VARCHAR(200) NOT NULL,
    `allele_reference`      VARCHAR(200),
    `allele_alternate`      VARCHAR(200),
    `p_value`               DOUBLE,
    `p_value_nlog`          DOUBLE, -- negative log10(P)
    `p_value_nlog_expected` DOUBLE, -- negative log10(P)
    `p_value_r`             DOUBLE,
    `odds_ratio`            DOUBLE,
    `odds_ratio_r`          DOUBLE,
    `n`                     BIGINT,
    `q`                     DOUBLE,
    `i`                     DOUBLE,
    `show_qq_plot`          BOOLEAN
) ENGINE=MYISAM;

-- Phenotype name is used as prefix
-- eg: melanoma_aggregate
CREATE TABLE IF NOT EXISTS `aggregate_$PHENOTYPE` (
    `id`            BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`        ENUM('all', 'female', 'male') NOT NULL,
    `chromosome`    VARCHAR(2) NOT NULL,
    `position_abs`  BIGINT NOT NULL,
    `p_value_nlog`  DOUBLE NOT NULL
) ENGINE=MYISAM;