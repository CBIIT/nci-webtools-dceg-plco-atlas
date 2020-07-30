-- participant data
ALTER TABLE participant_data
    ADD INDEX idx_participant_data__participant_id (participant_id),
    ADD INDEX idx_participant_data__value (value);

-- phenotype correlations
ALTER TABLE phenotype_correlation
    ADD INDEX idx_phenotype_correlation__phenotype_a (phenotype_a),
    ADD INDEX idx_phenotype_correlation__phenotype_b (phenotype_b);

-- phenotype metadata
ALTER TABLE phenotype_metadata
    ADD INDEX idx_phenotype_metadata__phenotype_id (phenotype_id),
    ADD INDEX idx_phenotype_metadata__sex (sex);

-- genes
ALTER TABLE gene
    ADD INDEX idx_gene__chromosome           (chromosome),
    ADD INDEX idx_gene__transcription_start  (transcription_start),
    ADD INDEX idx_gene__transcription_end    (transcription_end);

-- variants
ALTER TABLE phenotype_variant
    ADD INDEX idx_phenotype_variant__chromosome       (chromosome),
    ADD INDEX idx_phenotype_variant__p_value          (p_value),
    ADD INDEX idx_phenotype_variant__p_value_nlog     (p_value_nlog),
    ADD INDEX idx_phenotype_variant__position         (position),
    ADD INDEX idx_phenotype_variant__show_qq_plot     (show_qq_plot),
    ADD INDEX idx_phenotype_variant__snp              (snp);

-- aggregated variants
ALTER TABLE phenotype_aggregate
    ADD INDEX idx_phenotype_aggregate__chromosome     (chromosome),
    ADD INDEX idx_phenotype_aggregate__p_value_nlog   (p_value_nlog);

-- variant points
ALTER TABLE phenotype_point
    ADD INDEX idx_phenotype_point__p_value_nlog       (p_value_nlog);
