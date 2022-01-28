DELIMITER $$
DROP PROCEDURE IF EXISTS execute_sql $$
CREATE PROCEDURE execute_sql(IN sql_text varchar(16000))
BEGIN
    SET @sql = sql_text;
    PREPARE stmt from @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END $$

DROP PROCEDURE IF EXISTS drop_index_if_exists $$
CREATE PROCEDURE drop_index_if_exists(
  IN table_name VARCHAR(128),
  IN index_name VARCHAR(128))
BEGIN
IF((SELECT COUNT(*) AS index_exists
    FROM information_schema.statistics s
    WHERE s.table_schema = DATABASE()
      AND s.table_name = table_name
      AND s.index_name = index_name) > 0) THEN

    SET @s = CONCAT('DROP INDEX ' , index_name , ' ON ' , table_name);
    PREPARE stmt FROM @s;
    EXECUTE stmt;
END IF;
END $$

DROP PROCEDURE IF EXISTS insert_participant_data $$
CREATE PROCEDURE insert_participant_data()
  BEGIN
  DECLARE done INT;
  DECLARE name VARCHAR(200);
  DECLARE age_name VARCHAR(200);

  DECLARE phenotype_cursor CURSOR FOR
    SELECT p.name, p.age_name
      FROM information_schema.columns c
      INNER JOIN phenotype p ON c.column_name = p.name
      WHERE TABLE_NAME = 'participant_data_stage';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN phenotype_cursor;
  SET done = 0;
  REPEAT
    FETCH phenotype_cursor INTO name, age_name;
    SET @sql = CONCAT('
      INSERT INTO participant_data (`phenotype_id`, `participant_id`, `value`, `age`)
      SELECT
          (SELECT id FROM phenotype WHERE name = ''', name, ''' LIMIT 1) AS phenotype_id,
          id AS phenotype_sample_id,
          `', name, '` AS value,
          ', IFNULL(age_name, 'NULL'), ' AS age
      FROM participant_data_stage;
    ');
    PREPARE dynamic_statement FROM @sql;
    EXECUTE dynamic_statement;
    DEALLOCATE PREPARE dynamic_statement;
  UNTIL done END REPEAT;
  CLOSE phenotype_cursor;
END $$

DROP PROCEDURE IF EXISTS warmup_cache $$
CREATE PROCEDURE warmup_cache()
  BEGIN
  DECLARE done INT;
  DECLARE table_name VARCHAR(200);

  DECLARE variant_table_cursor CURSOR FOR
    select t.TABLE_NAME from INFORMATION_SCHEMA.TABLES t
    WHERE t.TABLE_NAME LIKE 'variant_%';

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  -- warm up aggregate table and indexes
  SELECT COUNT(*) from phenotype_aggregate;
  SELECT phenotype_id, sex, ancestry, COUNT(*) 
    FROM phenotype_aggregate 
    WHERE p_value_nlog > 3
    GROUP BY phenotype_id, sex, ancestry; 

  OPEN variant_table_cursor;
  SET done = 0;
  REPEAT
    FETCH variant_table_cursor INTO table_name;

    -- warm up phenotype indexes (do not use or to join conditions, as this will perform a full-table scan)
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' GROUP BY chromosome'));
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' WHERE position < 1e5'));
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' WHERE p_value < 0.00001'));
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' WHERE p_value_nlog > 3'));
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' WHERE snp = "1"'));

  UNTIL done END REPEAT;
  CLOSE variant_table_cursor;
END $$

DROP PROCEDURE IF EXISTS calculate_ci $$
CREATE PROCEDURE calculate_ci()
  BEGIN
  DECLARE done INT;
  DECLARE table_name VARCHAR(200);
  DECLARE phenotype_type VARCHAR(200);

  DECLARE variant_table_cursor CURSOR FOR
    select distinct concat('variant', '__', p.name, '__', pm.sex, '__', pm.ancestry), p.type
        from phenotype_metadata pm
        join phenotype p on pm.phenotype_id = p.id
    where chromosome = 'all' and count > 0;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN variant_table_cursor;
  SET done = 0;
  REPEAT
    FETCH variant_table_cursor INTO table_name, phenotype_type;

    IF(phenotype_type = 'binary') THEN
      call execute_sql(CONCAT('
        update ', table_name, ' set
            ci_95_low = exp(beta - 1.96 * standard_error),
            ci_95_high = exp(beta + 1.96 * standard_error);
      '));
    END IF;

    IF(phenotype_type = 'continuous') THEN
      call execute_sql(CONCAT('
        update ', table_name, ' set
            ci_95_low = beta - (1.96 * standard_error),
            ci_95_high = beta + (1.96 * standard_error);
      '));
    END IF;

  UNTIL done END REPEAT;
  CLOSE variant_table_cursor;
END $$

DROP PROCEDURE IF EXISTS migrate_ci $$
CREATE PROCEDURE migrate_ci()
  BEGIN
  DECLARE done INT;
  DECLARE table_name VARCHAR(200);

  DECLARE variant_table_cursor CURSOR FOR
    select t.TABLE_NAME from INFORMATION_SCHEMA.TABLES t
    WHERE t.TABLE_NAME LIKE 'var__%';

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN variant_table_cursor;
  SET done = 0;
  REPEAT
    FETCH variant_table_cursor INTO table_name;

    call execute_sql(concat('alter table ', table_name, ' add column beta_ci_95_low decimal(64,16) AS (beta - (1.96 * standard_error)) NULL'));
    call execute_sql(concat('alter table ', table_name, ' add column beta_ci_95_high decimal(64,16) AS (beta + (1.96 * standard_error)) NULL'));
    call execute_sql(concat('alter table ', table_name, ' add column odds_ratio_ci_95_low decimal(64,16) AS (EXP(beta - (1.96 * standard_error))) NULL'));
    call execute_sql(concat('alter table ', table_name, ' add column odds_ratio_ci_95_high decimal(64,16) AS (EXP(beta + (1.96 * standard_error))) NULL'));
    call execute_sql(concat('ALTER TABLE ', table_name, ' add column allele_effect varchar(200) as (allele_reference) NULL'));
    call execute_sql(concat('ALTER TABLE ', table_name, ' add column allele_non_effect varchar(200) as (allele_alternate) NULL'));
    call execute_sql(concat('ALTER TABLE ', table_name, ' add column allele_effect_frequency double as (allele_frequency) NULL'));

  UNTIL done END REPEAT;
  CLOSE variant_table_cursor;
END $$

DELIMITER ;