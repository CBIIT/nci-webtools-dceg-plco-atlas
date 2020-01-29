CREATE TABLE `lu_phenotype` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `parent_id`     INTEGER NULL,
    `name`          VARCHAR(200) NOT NULL,
    `display_name`  VARCHAR(200) NOT NULL
    FOREIGN KEY (parent_id) REFERENCES lu_phenotype(id)
);

CREATE TABLE `phenotype_correlation` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_a`   INTEGER NOT NULL,
    `phenotype_b`   INTEGER NOT NULL,
    `value`         DOUBLE NOT NULL,
    FOREIGN KEY (phenotype_a) REFERENCES lu_phenotype(id),
    FOREIGN KEY (phenotype_b) REFERENCES lu_phenotype(id),
    INDEX (phenotype_a),
    INDEX (phenotype_b)
);

CREATE TABLE `phenotype_metadata` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id`  INTEGER UNIQUE,
    `gender`        ENUM('all', 'female', 'male'),
    `lambda_gc`     DOUBLE,
    FOREIGN KEY (phenotype_id) REFERENCES lu_phenotype(id),
    INDEX (phenotype_id),
    INDEX (gender)
);

CREATE TABLE `gene` (
    `id`                    INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(200) NOT NULL,
    `chromosome`            VARCHAR(2) NOT NULL,
    `strand`                CHAR NOT NULL,
    `transcription_start`   INTEGER NOT NULL,
    `transcription_end`     INTEGER NOT NULL,
    `exon_starts`           MEDIUMTEXT,
    `exon_ends`             MEDIUMTEXT,
    INDEX (transcription_start),
    INDEX (transcription_end)
);

CREATE TABLE `import_log` (
    `id`                    INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id`          INTEGER UNIQUE,
    `variants_provided`     BIGINT,
    `variants_imported`     BIGINT,
    `created_date`          DATETIME
    FOREIGN KEY (phenotype_id) REFERENCES lu_phenotype(id)
);
