DROP TABLE IF EXISTS ${table_name};
CREATE TABLE IF NOT EXISTS `${table_name}` (
    `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id` INTEGER,
    `sex` VARCHAR(20),
    `ancestry` VARCHAR(40),
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
        'Y',
        'all'
    ) NOT NULL,
    `lambda_gc` DOUBLE,
    `lambda_gc_ld_score` DOUBLE,
    `average_value` DOUBLE,
    `standard_deviation` DOUBLE,
    `count` BIGINT,
    `participant_count` INTEGER,
    `participant_count_case` INTEGER,
    `participant_count_control` INTEGER,
    UNIQUE KEY (`phenotype_id`, `sex`, `ancestry`, `chromosome`)
);