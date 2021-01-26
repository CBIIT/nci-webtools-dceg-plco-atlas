CREATE TABLE IF NOT EXISTS ${table_name}
(
    id bigint auto_increment,
    phenotype_id int not null,
    sex VARCHAR(20),
    ancestry VARCHAR(20),
    p_value_nlog double null,
    p_value_nlog_expected double null,
    primary key (id, phenotype_id, sex, ancestry)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;