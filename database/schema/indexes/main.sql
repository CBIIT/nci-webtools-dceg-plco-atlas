-- genes
ALTER TABLE gene
    ADD INDEX idx_gene__chromosome           (chromosome),
    ADD INDEX idx_gene__transcription_start  (transcription_start),
    ADD INDEX idx_gene__transcription_end    (transcription_end);

-- participant data
ALTER TABLE participant_data
    ADD INDEX idx_participant_data__participant_id (participant_id),
    ADD INDEX idx_participant_data__value (value);

-- participants
ALTER TABLE participant
    ADD INDEX idx_participant__plco_id (plco_id);

-- phenotype correlations
ALTER TABLE phenotype_correlation
    ADD INDEX idx_phenotype_correlation__phenotype_a (phenotype_a),
    ADD INDEX idx_phenotype_correlation__phenotype_b (phenotype_b);

-- phenotype metadata
ALTER TABLE phenotype_metadata
    ADD INDEX idx_phenotype_metadata__phenotype_id (phenotype_id),
    ADD INDEX idx_phenotype_metadata__sex (sex),
    ADD INDEX idx_phenotype_metadata__ancestry (ancestry);

-- aggregated variants
ALTER TABLE phenotype_aggregate
    ADD INDEX idx_phenotype_aggregate_query (sex, ancestry, p_value_nlog);

-- aggregated variants
ALTER TABLE phenotype_point
    ADD INDEX idx_phenotype_point_query (sex, ancestry, p_value_nlog);

ALTER TABLE principal_component_analysis
    ADD INDEX idx_principal_component_analysis__participant_id (participant_id);
    ADD INDEX idx_principal_component_analysis__principal_component (principal_component);
