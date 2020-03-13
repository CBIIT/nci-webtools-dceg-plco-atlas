CREATE TABLE `phenotype` (
    `id`                    INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `parent_id`             INTEGER NULL,
    `name`                  VARCHAR(200) NOT NULL,
    `display_name`          VARCHAR(200) NOT NULL,
    `description`           MEDIUMTEXT,
    `color`                 VARCHAR(40) NULL,
    `type`                  ENUM('binary', 'categorical', 'continuous'),
    `participant_count`     BIGINT,
    `import_count`          BIGINT,
    `import_date`          DATETIME,
    FOREIGN KEY (parent_id) REFERENCES phenotype(id)
);

CREATE TABLE `phenotype_metadata` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id`  INTEGER,
    `gender`        ENUM('all', 'female', 'male'),
    `chromosome`    ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y') NOT NULL,
    `lambda_gc`     DOUBLE,
    `count`         BIGINT,
    FOREIGN KEY (phenotype_id) REFERENCES phenotype(id),
    UNIQUE KEY (`phenotype_id`, `gender`, `chromosome`)
);

CREATE TABLE `phenotype_correlation` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_a`   INTEGER NOT NULL,
    `phenotype_b`   INTEGER NOT NULL,
    `value`         DOUBLE NOT NULL,
    FOREIGN KEY (phenotype_a) REFERENCES phenotype(id),
    FOREIGN KEY (phenotype_b) REFERENCES phenotype(id)
);

CREATE TABLE `participant` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `age`           INTEGER,
    `gender`        ENUM('male', 'female'),
    `ancestry`      ENUM('white', 'black', 'hispanic', 'asian', 'pacific_islander', 'american_indian')
);

CREATE TABLE `participant_data` (
    `id`                BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id`      INTEGER NOT NULL,
    `participant_id`    INTEGER,
    `value`             DOUBLE,
    FOREIGN KEY (phenotype_id) REFERENCES phenotype(id),
    FOREIGN KEY (participant_id) REFERENCES participant(id)
);

CREATE TABLE `participant_data_category` (
    `id`                    INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id`          INTEGER NOT NULL,
    `value`                 INTEGER,
    `label`                 TEXT
    FOREIGN KEY (phenotype_id) REFERENCES phenotype(id)
);

CREATE TABLE `chromosome_range` (
    `id`                    INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `chromosome`            ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y') NOT NULL,
    `position_min`          BIGINT NOT NULL,
    `position_max`          BIGINT NOT NULL,
    `position_abs_min`      BIGINT NOT NULL,
    `position_abs_max`      BIGINT NOT NULL
);

CREATE TABLE `gene` (
    `id`                    INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(200) NOT NULL,
    `chromosome`            ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y') NOT NULL,
    `strand`                CHAR NOT NULL,
    `transcription_start`   INTEGER NOT NULL,
    `transcription_end`     INTEGER NOT NULL,
    `exon_starts`           MEDIUMTEXT,
    `exon_ends`             MEDIUMTEXT
);
