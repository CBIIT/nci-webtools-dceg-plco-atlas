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
create procedure insert_participant_data()
  BEGIN
  DECLARE done INT;
  DECLARE phenotype_name VARCHAR(200);
  DECLARE phenotype_name_cursor CURSOR FOR
    SELECT column_name FROM information_schema.columns
      WHERE TABLE_NAME = 'participant_data_stage'
      AND column_name IN (SELECT name from phenotype WHERE type IS NOT NULL);
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN phenotype_name_cursor;
  SET done = 0;
  REPEAT
    FETCH phenotype_name_cursor INTO phenotype_name;
    SET @sql = CONCAT('
      INSERT INTO participant_data (`phenotype_id`, `participant_id`, `value`)
      SELECT
          (SELECT id FROM phenotype WHERE name = ''', phenotype_name, ''' LIMIT 1) AS phenotype_id,
          id AS phenotype_sample_id,
          `', phenotype_name, '` AS value
      FROM phenotype_data_stage;
    ');
    PREPARE dynamic_statement FROM @sql;
    EXECUTE dynamic_statement;
    DEALLOCATE PREPARE dynamic_statement;
  UNTIL done END REPEAT;
  CLOSE phenotype_name_cursor;
END $$


DELIMITER ;

