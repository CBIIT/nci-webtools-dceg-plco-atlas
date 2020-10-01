ALTER TABLE ${table_name}
    ADD INDEX (chromosome),
    ADD INDEX (p_value),
    ADD INDEX (p_value_nlog),
    ADD INDEX (position),
    ADD INDEX (snp);