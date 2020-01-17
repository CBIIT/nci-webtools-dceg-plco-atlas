DROP TABLE `phenotype_correlation`;
DROP TABLE `phenotype_metadata`;
DROP TABLE `lu_phenotype`;
DROP TABLE `variant`;
DROP TABLE `aggregate`;
DROP TABLE `gene`;



CREATE TABLE `lu_phenotype` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(200),
    `display_name`  VARCHAR(200),
    `parent_id`     INTEGER,
    FOREIGN KEY (parent_id) REFERENCES lu_phenotype(id)
);

CREATE TABLE `phenotype_correlation` (
    `a` INTEGER,
    `b` INTEGER,
    `value` DOUBLE,
    FOREIGN KEY (a) REFERENCES lu_phenotype(id),
    FOREIGN KEY (b) REFERENCES lu_phenotype(id)
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
    `id`            BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`        ENUM('all', 'female', 'male'),
    `chr`           VARCHAR(2),
    `bp`            BIGINT,
    `snp`           VARCHAR(200),
    `a1`            VARCHAR(200),
    `a2`            VARCHAR(200),
    `n`             BIGINT,
    `p`             DOUBLE,
    `p_expected`    DOUBLE,
    `p_nlog`        DOUBLE, -- negative log10(P)
    `p_r`           DOUBLE,
    `or`            DOUBLE,
    `or_r`          DOUBLE,
    `q`             DOUBLE,
    `i`             DOUBLE,
    `show_qq_plot`  BOOLEAN
);

-- Phenotype name is used as prefix
-- eg: melanoma_aggregate
CREATE TABLE `aggregate` (
    `id`            BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `gender`        ENUM('all', 'female', 'male'),
    `bp_abs`        BIGINT,
    `p_nlog`        DOUBLE
);

CREATE TABLE `gene` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(200),
    `chr`           VARCHAR(2),
    `strand`        CHAR,
    `tx_start`      INTEGER,
    `tx_end`        INTEGER,
    `exon_starts`   MEDIUMTEXT,
    `exon_ends`     MEDIUMTEXT
);


-- Indexes are created after inserting data
ALTER TABLE lu_phenotype ADD INDEX (id);

ALTER TABLE phenotype_correlation ADD INDEX(a, b);

ALTER TABLE phenotype_metadata ADD INDEX(phenotype_id);

ALTER TABLE variant ADD INDEX(id);
ALTER TABLE variant ADD INDEX(gender);
ALTER TABLE variant ADD INDEX(chr);
ALTER TABLE variant ADD INDEX(snp);
ALTER TABLE variant ADD INDEX(p);
ALTER TABLE variant ADD INDEX(p_nlog);
ALTER TABLE variant ADD INDEX(show_qq_plot);

ALTER TABLE aggregate ADD INDEX(id);
ALTER TABLE aggregate ADD INDEX(gender);
ALTER TABLE aggregate ADD INDEX(bp_abs);
ALTER TABLE aggregate ADD INDEX(p_nlog);

ALTER TABLE gene ADD INDEX(id);
ALTER TABLE gene ADD INDEX(tx_start);
ALTER TABLE gene ADD INDEX(tx_end);
