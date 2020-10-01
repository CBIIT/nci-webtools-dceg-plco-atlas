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

  DECLARE phenotype_variant_table_cursor CURSOR FOR
    select t.TABLE_NAME from INFORMATION_SCHEMA.TABLES t
    WHERE t.TABLE_NAME LIKE 'phenotype_variant_%';

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  -- warm up aggregate table and indexes
  SELECT COUNT(*) from phenotype_aggregate;
  SELECT phenotype_id, sex, ancestry, COUNT(*) 
    FROM phenotype_aggregate 
    WHERE p_value_nlog > 3
    GROUP BY phenotype_id, sex, ancestry; 

  OPEN phenotype_variant_table_cursor;
  SET done = 0;
  REPEAT
    FETCH phenotype_variant_table_cursor INTO table_name;

    -- warm up phenotype indexes (do not use or to join conditions, as this will perform a full-table scan)
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' GROUP BY chromosome'));
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' WHERE position < 1e5'));
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' WHERE p_value < 0.00001'));
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' WHERE p_value_nlog > 3'));
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' WHERE snp = "1"'));

  UNTIL done END REPEAT;
  CLOSE phenotype_variant_table_cursor;
END $$

DELIMITER ;

