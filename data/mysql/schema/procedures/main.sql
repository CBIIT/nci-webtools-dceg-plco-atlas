DELIMITER $$

DROP PROCEDURE IF EXISTS drop_index_if_exists $$
CREATE PROCEDURE drop_index_if_exists(in table_name varchar(128), in index_name varchar(128) )
BEGIN
 IF((SELECT COUNT(*) AS index_exists FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() and table_name =
table_name AND index_name = index_name) > 0) THEN
   SET @s = CONCAT('DROP INDEX ' , index_name , ' ON ' , table_name);
   PREPARE stmt FROM @s;
   EXECUTE stmt;
 END IF;
END $$

DELIMITER ;