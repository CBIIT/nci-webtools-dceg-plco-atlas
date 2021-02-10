START TRANSACTION;

DROP TABLE IF EXISTS 
    participant_data_category,
    participant_data,
    participant,
    phenotype_correlation,
    phenotype_metadata,
    phenotype,
    variant_aggregate, 
    variant_metadata, 
    chromosome_range, 
    lookup_sex, 
    lookup_ancestry;

COMMIT;