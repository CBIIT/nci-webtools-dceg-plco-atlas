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

DROP PROCEDURE IF EXISTS update_phenotype_point $$
CREATE PROCEDURE update_phenotype_point()
  BEGIN
  DECLARE done INT;
  DECLARE phenotype_id INT;
  DECLARE sex VARCHAR(200);
  DECLARE partitions_exist INT;

  DECLARE phenotype_cursor CURSOR FOR
    select distinct p.id, pm.sex as sex from phenotype p
    join phenotype_metadata pm on pm.phenotype_id = p.id
    where pm.count > 0 and pm.chromosome = 'all';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN phenotype_cursor;
  SET done = 0;
  REPEAT
    FETCH phenotype_cursor INTO phenotype_id, sex;

    -- create partition for points if they do not already exist
    SELECT COUNT(*) INTO partitions_exist FROM INFORMATION_SCHEMA.PARTITIONS
    WHERE TABLE_NAME = "phenotype_point" AND PARTITION_NAME = phenotype_id;

    IF partitions_exist = 0 THEN
        call execute_sql(CONCAT('
            ALTER TABLE phenotype_point ADD PARTITION (PARTITION `', phenotype_id, '` VALUES IN (', phenotype_id, ') (
                subpartition `', phenotype_id, '_all`,
                subpartition `', phenotype_id, '_female`,
                subpartition `', phenotype_id, '_male`
            ))'
        ));
    END IF;

    -- insert variants into partition
    call execute_sql(CONCAT('
        INSERT INTO phenotype_point PARTITION (`', phenotype_id, '_', sex, '`)
        (phenotype_id, sex, chromosome, position, snp, p_value_nlog, p_value_nlog_expected)
        SELECT ', phenotype_id, ', "', sex, '", chromosome, position, snp, p_value_nlog, p_value_nlog_expected
        FROM phenotype_variant PARTITION (`', phenotype_id, '_', sex, '`)
        WHERE show_qq_plot = 1 OR p_value_nlog > 3'
    ));
  UNTIL done END REPEAT;
  CLOSE phenotype_cursor;
END $$


DELIMITER ;

