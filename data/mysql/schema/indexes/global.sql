-- phenotype correlations
CREATE INDEX idx_phenotype_correlation__phenotype_a ON phenotype_correlation(phenotype_a);
CREATE INDEX idx_phenotype_correlation__phenotype_b ON phenotype_correlation(phenotype_b);

-- phenotype metadata
CREATE INDEX idx_phenotype_metadata__phenotype_id ON phenotype_metadata(phenotype_id);
CREATE INDEX idx_phenotype_metadata__gender ON phenotype_metadata(gender);

-- gene
CREATE INDEX idx_gene__chromosome ON gene(chromosome);
CREATE INDEX idx_gene__transcription_start ON gene(transcription_start);
CREATE INDEX idx_gene__transcription_end ON gene(transcription_end);

-- import log
CREATE INDEX idx_import_log__phenotype_id ON import_log(phenotype_id);
