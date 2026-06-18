-- Minimal schema needed for the GWAS Explorer "Phenotype Characteristics"
-- phenotype tree to load locally. This is a trimmed subset of the production
-- PLCO schema (database/schema/tables/main.sql) -- just the `phenotype` table
-- and the `v_phenotype` view that server getPhenotypes() reads from.
--
-- The self-referential FK on parent_id is intentionally omitted so the seed
-- can be inserted in any order.

CREATE DATABASE IF NOT EXISTS plcogwas;
USE plcogwas;

CREATE TABLE IF NOT EXISTS `phenotype` (
  `id` INTEGER PRIMARY KEY NOT NULL,
  `parent_id` INTEGER NULL,
  `name` VARCHAR(200),
  `age_name` VARCHAR(200),
  `display_name` VARCHAR(200),
  `description` MEDIUMTEXT,
  `color` VARCHAR(40),
  `type` ENUM('binary', 'categorical', 'continuous') NULL,
  `sex_specific` ENUM('female', 'male') NULL,
  `participant_count` BIGINT,
  `import_count` BIGINT,
  `import_date` DATETIME
);

-- getPhenotypes() selects from v_phenotype and expects a `link` column.
-- In production this comes from a study join; locally we expose it as NULL.
CREATE OR REPLACE VIEW `v_phenotype` AS
  SELECT p.*, NULL AS `link` FROM `phenotype` p;

-- Additional tables queried on the Phenotypes page load (getRanges,
-- getMetadata). Created empty so those endpoints return [] (200) instead of
-- 500; foreign keys to lookup tables are omitted for the local subset.

CREATE TABLE IF NOT EXISTS `chromosome_range` (
  `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `chromosome` VARCHAR(2) NOT NULL,
  `position_min` BIGINT NOT NULL,
  `position_max` BIGINT NOT NULL,
  `position_abs_min` BIGINT NOT NULL,
  `position_abs_max` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `phenotype_metadata` (
  `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `phenotype_id` INTEGER,
  `sex` VARCHAR(20),
  `ancestry` VARCHAR(40),
  `chromosome` VARCHAR(4) NOT NULL DEFAULT 'all',
  `lambda_gc` DOUBLE,
  `lambda_gc_ld_score` DOUBLE,
  `average_value` DOUBLE,
  `standard_deviation` DOUBLE,
  `count` BIGINT,
  `participant_count` BIGINT,
  `participant_count_case` BIGINT,
  `participant_count_control` BIGINT
);
