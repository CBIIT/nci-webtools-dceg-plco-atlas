-- Indexes are created after inserting data
ALTER TABLE `lu_phenotype` ADD INDEX (id);

ALTER TABLE `phenotype_correlation` ADD INDEX(phenotype_a);
ALTER TABLE `phenotype_correlation` ADD INDEX(phenotype_b);

ALTER TABLE `phenotype_metadata` ADD INDEX(phenotype_id);
ALTER TABLE `phenotype_metadata` ADD INDEX(gender);

ALTER TABLE `variant` ADD INDEX(id);
ALTER TABLE `variant` ADD INDEX(gender);
ALTER TABLE `variant` ADD INDEX(chromosome);
ALTER TABLE `variant` ADD INDEX(position);
ALTER TABLE `variant` ADD INDEX(snp);
ALTER TABLE `variant` ADD INDEX(p);
ALTER TABLE `variant` ADD INDEX(p_nlog);
ALTER TABLE `variant` ADD INDEX(show_qq_plot);

ALTER TABLE `aggregate` ADD INDEX(id);
ALTER TABLE `aggregate` ADD INDEX(gender);
ALTER TABLE `aggregate` ADD INDEX(position_abs);
ALTER TABLE `aggregate` ADD INDEX(p_nlog);

ALTER TABLE `gene` ADD INDEX(id);
ALTER TABLE `gene` ADD INDEX(transcription_start);
ALTER TABLE `gene` ADD INDEX(transcription_end);
