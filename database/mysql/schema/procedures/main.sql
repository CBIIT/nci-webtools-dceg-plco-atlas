DELIMITER $$

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

DELIMITER ;

