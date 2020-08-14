SET default_storage_engine = INNODB;

CREATE TABLE IF NOT EXISTS `phenotype` (
    `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER NULL,
    `name` VARCHAR(200),
    `age_name` VARCHAR(200),
    `display_name` VARCHAR(200),
    `description` MEDIUMTEXT,
    `color` VARCHAR(40),
    `type` ENUM('binary', 'categorical', 'continuous') NULL,
    `participant_count` BIGINT,
    `import_count` BIGINT,
    `import_date` DATETIME,
    FOREIGN KEY (parent_id) REFERENCES phenotype(id)
);

CREATE TABLE IF NOT EXISTS `phenotype_metadata` (
    `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id` INTEGER,
    `sex` ENUM('all', 'female', 'male'),
    `chromosome` ENUM(
        'all',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        'X',
        'Y'
    ) NOT NULL,
    `lambda_gc` DOUBLE,
    `average_value` DOUBLE,
    `standard_deviation` DOUBLE,
    `count` BIGINT,
    FOREIGN KEY (phenotype_id) REFERENCES phenotype(id),
    UNIQUE KEY (`phenotype_id`, `sex`, `chromosome`)
);

CREATE TABLE IF NOT EXISTS `phenotype_correlation` (
    `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_a` INTEGER NOT NULL,
    `phenotype_b` INTEGER NOT NULL,
    `value` DOUBLE NOT NULL,
    FOREIGN KEY (phenotype_a) REFERENCES phenotype(id),
    FOREIGN KEY (phenotype_b) REFERENCES phenotype(id)
);

CREATE TABLE IF NOT EXISTS `participant` (
    `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `sex` ENUM('female', 'male'),
    `ancestry` ENUM(
        'white',
        'black',
        'hispanic',
        'asian',
        'pacific_islander',
        'american_indian'
    )
);

CREATE TABLE IF NOT EXISTS `participant_data` (
    `id` BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id` INTEGER NOT NULL,
    `participant_id` INTEGER,
    `value` DOUBLE,
    `age` INTEGER,
    FOREIGN KEY (phenotype_id) REFERENCES phenotype(id),
    FOREIGN KEY (participant_id) REFERENCES participant(id)
);

CREATE TABLE IF NOT EXISTS `participant_data_category` (
    `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id` INTEGER NOT NULL,
    `value` DOUBLE,
    `label` TEXT,
    `display_distribution` BOOLEAN,
    `order` INTEGER,
    FOREIGN KEY (phenotype_id) REFERENCES phenotype(id)
);

CREATE TABLE IF NOT EXISTS `chromosome_range` (
    `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `chromosome` ENUM(
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        'X',
        'Y'
    ) NOT NULL,
    `position_min` BIGINT NOT NULL,
    `position_max` BIGINT NOT NULL,
    `position_abs_min` BIGINT NOT NULL,
    `position_abs_max` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `gene` (
    `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `chromosome` ENUM(
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        'X',
        'Y'
    ) NOT NULL,
    `strand` CHAR NOT NULL,
    `transcription_start` INTEGER NOT NULL,
    `transcription_end` INTEGER NOT NULL,
    `exon_starts` MEDIUMTEXT,
    `exon_ends` MEDIUMTEXT
);

CREATE TABLE IF NOT EXISTS phenotype_variant (
    id BIGINT AUTO_INCREMENT NOT NULL,
    phenotype_id INTEGER NOT NULL,
    sex ENUM('all', 'female', 'male') NOT NULL,
    chromosome ENUM(
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        'X',
        'Y'
    ) NOT NULL,
    position int NOT NULL,
    snp varchar(200) NOT NULL,
    allele_reference varchar(200) NULL,
    allele_alternate varchar(200) NULL,
    allele_reference_frequency double NULL,
    p_value double NULL,
    p_value_nlog double NULL,
    p_value_nlog_expected double NULL,
    p_value_heterogenous double NULL,
    beta double NULL,
    standard_error double NULL,
    odds_ratio double NULL,
    ci_95_low double NULL,
    ci_95_high double NULL,
    n int NULL,
    show_qq_plot BOOLEAN NULL,
    PRIMARY KEY (id, phenotype_id, sex)
) PARTITION BY list(phenotype_id) SUBPARTITION BY LINEAR KEY(sex) SUBPARTITIONs 3 (
    PARTITION `0`
    VALUES
        IN (0) (
            SUBPARTITION `0_all`,
            SUBPARTITION `0_female`,
            SUBPARTITION `0_male`
        )
);

CREATE TABLE IF NOT EXISTS phenotype_aggregate (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `phenotype_id` INTEGER NOT NULL,
    `sex` ENUM('all', 'female', 'male') NOT NULL,
    `chromosome` ENUM(
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        'X',
        'Y'
    ) NOT NULL,
    `position_abs` BIGINT NOT NULL,
    `p_value_nlog` DOUBLE NOT NULL,
    PRIMARY KEY (id, phenotype_id, sex)
) PARTITION BY list(phenotype_id) SUBPARTITION BY LINEAR KEY(sex) SUBPARTITIONS 3 (
    PARTITION `0`
    VALUES
        IN (0) (
            SUBPARTITION `0_all`,
            SUBPARTITION `0_female`,
            SUBPARTITION `0_male`
        )
);

CREATE TABLE IF NOT EXISTS phenotype_point
(
	id bigint auto_increment,
	phenotype_id int not null,
	sex enum('all', 'female', 'male') not null,
	p_value_nlog double null,
	p_value_nlog_expected double null,
	primary key (id, phenotype_id, sex)
) PARTITION BY list(phenotype_id) SUBPARTITION BY LINEAR KEY(sex) SUBPARTITIONs 3 (
    PARTITION `0`
    VALUES
        IN (0) (
            SUBPARTITION `0_all`,
            SUBPARTITION `0_female`,
            SUBPARTITION `0_male`
        )
);

CREATE TABLE IF NOT EXISTS share_link (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `share_id` CHAR(36) UNIQUE,
  `route` VARCHAR(100),
  `parameters` JSON,
  `created_date` DATETIME
);