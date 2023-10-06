SET default_storage_engine = INNODB;
SET GLOBAL local_infile=1;

CREATE TABLE IF NOT EXISTS `study` (
    `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `pubmed_id` VARCHAR(200),
    `display_name` VARCHAR(200),
    `description` MEDIUMTEXT,
    `link` VARCHAR(200)
);