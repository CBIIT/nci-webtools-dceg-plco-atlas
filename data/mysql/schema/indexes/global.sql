-- phenotype correlations
ALTER TABLE phenotype_correlation
    ADD INDEX idx_phenotype_correlation__phenotype_a (phenotype_a),
    ADD INDEX idx_phenotype_correlation__phenotype_b (phenotype_b);

-- phenotype metadata
ALTER TABLE phenotype_metadata
    ADD INDEX idx_phenotype_metadata__phenotype_id  (phenotype_id),
    ADD INDEX idx_phenotype_metadata__gender        (gender);

-- gene
ALTER TABLE gene
    ADD INDEX idx_gene__chromosome           (chromosome),
    ADD INDEX idx_gene__transcription_start  (transcription_start),
    ADD INDEX idx_gene__transcription_end    (transcription_end);

-- import log
ALTER TABLE import_log
    ADD INDEX idx_import_log__phenotype_id   (phenotype_id);
