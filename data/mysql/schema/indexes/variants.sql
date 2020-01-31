-- variants table
CREATE INDEX idx_$PHENOTYPE_variant__gender ON $PHENOTYPE_variant(gender);
CREATE INDEX idx_$PHENOTYPE_variant__chromosome ON $PHENOTYPE_variant(chromosome);
CREATE INDEX idx_$PHENOTYPE_variant__position ON $PHENOTYPE_variant(position);
CREATE INDEX idx_$PHENOTYPE_variant__p_value_nlog ON $PHENOTYPE_variant(p_value_nlog);
CREATE INDEX idx_$PHENOTYPE_variant__snp ON $PHENOTYPE_variant(snp);
CREATE INDEX idx_$PHENOTYPE_variant__show_qq_plot ON $PHENOTYPE_variant(show_qq_plot);

-- aggregated variants table
CREATE INDEX idx_$PHENOTYPE_aggregate__gender on $PHENOTYPE_aggregate(gender);
CREATE INDEX idx_$PHENOTYPE_aggregate__position_abs on $PHENOTYPE_aggregate(position_abs);
CREATE INDEX idx_$PHENOTYPE_aggregate__p_value_nlog on $PHENOTYPE_aggregate(p_value_nlog);