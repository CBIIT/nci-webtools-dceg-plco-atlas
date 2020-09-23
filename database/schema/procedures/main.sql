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
BEGIN
  DECLARE done INT;
  DECLARE phenotype_id INT;
  DECLARE phenotype_name VARCHAR(100);
  DECLARE sex VARCHAR(200);
  DECLARE ancestry VARCHAR(200);
  DECLARE partitions_exist INT;

  DECLARE phenotype_cursor CURSOR FOR
    select distinct p.id, p.name, pm.sex as sex, pm.ancestry as ancestry from phenotype p
    inner join phenotype_metadata pm on pm.phenotype_id = p.id
    inner join information_schema.tables t on t.TABLE_NAME = concat('phenotype_variant__', p.name, '__', pm.sex, '__', pm.ancestry)
    where pm.count > 0 and pm.chromosome = 'all' and pm.sex != 'stacked';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN phenotype_cursor;
  SET done = 0;
  REPEAT
    FETCH phenotype_cursor INTO phenotype_id, phenotype_name, sex, ancestry;

    -- create partition for points if they do not already exist
    SELECT COUNT(*) INTO partitions_exist FROM INFORMATION_SCHEMA.PARTITIONS
    WHERE TABLE_NAME = "phenotype_point" AND PARTITION_NAME = phenotype_id;

    IF partitions_exist = 0 THEN
        call execute_sql(concat('
          ALTER TABLE phenotype_point
          ADD PARTITION (PARTITION `', phenotype_id, '` VALUES IN (', phenotype_id, '))'
        ));
    END IF;

    -- insert variants into partition
    call execute_sql(concat('
        INSERT INTO phenotype_point PARTITION (`', phenotype_id, '`)
        (phenotype_id, sex, ancestry, p_value_nlog, p_value_nlog_expected)
        SELECT ', phenotype_id, ', "', sex, '", "', ancestry, '", p_value_nlog, p_value_nlog_expected
        FROM phenotype_variant__', phenotype_name, '__', sex, '__', ancestry, '
        WHERE show_qq_plot = 1'
    ));
  UNTIL done END REPEAT;
  CLOSE phenotype_cursor;
END; $$


DROP PROCEDURE IF EXISTS migrate_phenotype_variants $$
CREATE PROCEDURE migrate_phenotype_variants(IN partition_name varchar(2000))
  BEGIN
  
  call execute_sql(concat('DROP TABLE IF EXISTS phenotype_variant_', partition_name));
  call execute_sql(concat(
    'CREATE TABLE IF NOT EXISTS phenotype_variant_', partition_name, ' (
        id BIGINT AUTO_INCREMENT NOT NULL,
        chromosome INTEGER,
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
        PRIMARY KEY (id, chromosome)
    ) PARTITION BY LIST(chromosome) (
        PARTITION `', partition_name, '_1` VALUES IN (1),
        PARTITION `', partition_name, '_2` VALUES IN (2),
        PARTITION `', partition_name, '_3` VALUES IN (3),
        PARTITION `', partition_name, '_4` VALUES IN (4),
        PARTITION `', partition_name, '_5` VALUES IN (5),
        PARTITION `', partition_name, '_6` VALUES IN (6),
        PARTITION `', partition_name, '_7` VALUES IN (7),
        PARTITION `', partition_name, '_8` VALUES IN (8),
        PARTITION `', partition_name, '_9` VALUES IN (9),
        PARTITION `', partition_name, '_10` VALUES IN (10),
        PARTITION `', partition_name, '_11` VALUES IN (11),
        PARTITION `', partition_name, '_12` VALUES IN (12),
        PARTITION `', partition_name, '_13` VALUES IN (13),
        PARTITION `', partition_name, '_14` VALUES IN (14),
        PARTITION `', partition_name, '_15` VALUES IN (15),
        PARTITION `', partition_name, '_16` VALUES IN (16),
        PARTITION `', partition_name, '_17` VALUES IN (17),
        PARTITION `', partition_name, '_18` VALUES IN (18),
        PARTITION `', partition_name, '_19` VALUES IN (19),
        PARTITION `', partition_name, '_20` VALUES IN (20),
        PARTITION `', partition_name, '_21` VALUES IN (21),
        PARTITION `', partition_name, '_22` VALUES IN (22)
    )'));
  call execute_sql(concat(
    'INSERT INTO phenotype_variant_', partition_name, '
      SELECT 
        id,
        chromosome,
        position,
        snp,
        allele_reference,
        allele_alternate,
        allele_reference_frequency,
        p_value,
        p_value_nlog,
        p_value_nlog_expected,
        p_value_heterogenous,
        beta,
        standard_error,
        odds_ratio,
        ci_95_low,
        ci_95_high,
        n,
        show_qq_plot
      FROM phenotype_variant PARTITION (`', partition_name, '`)'
    ));

  call execute_sql(concat(
    'ALTER TABLE phenotype_variant_', partition_name, '
        ADD INDEX idx_phenotype_variant__p_value          (p_value),
        ADD INDEX idx_phenotype_variant__p_value_nlog     (p_value_nlog),
        ADD INDEX idx_phenotype_variant__position         (position),
        ADD INDEX idx_phenotype_variant__show_qq_plot     (show_qq_plot),
        ADD INDEX idx_phenotype_variant__snp              (snp);'
  ));

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
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' WHERE show_qq_plot = 1'));
    call execute_sql(CONCAT('SELECT COUNT(*) FROM ', table_name, ' WHERE snp = "1"'));

  UNTIL done END REPEAT;
  CLOSE phenotype_variant_table_cursor;
END $$

DELIMITER ;

