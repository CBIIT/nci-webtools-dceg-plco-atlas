CREATE INDEX idx_variant_all_id     ON variant_all(variant_id);
CREATE INDEX idx_variant_all_chr    ON variant_all(chr);
CREATE INDEX idx_variant_all_bp     ON variant_all(bp);
CREATE INDEX idx_variant_all_snp    ON variant_all(snp);
CREATE INDEX idx_variant_all_p      ON variant_all(p);
CREATE INDEX idx_variant_all_nlog_p ON variant_all(nlog_p);
CREATE INDEX idx_variant_all_query  ON variant_all(chr, bp, nlog_p);

CREATE INDEX idx_aggregate_all_chr           ON aggregate_all(chr);
CREATE INDEX idx_aggregate_all_bp_abs_1000kb ON aggregate_all(bp_abs_1000kb);
CREATE INDEX idx_aggregate_all_nlog_p2       ON aggregate_all(nlog_p2);
CREATE INDEX idx_aggregate_all_query         ON aggregate_all(chr, bp_abs_1000kb, nlog_p2);


CREATE INDEX idx_variant_female_id     ON variant_female(variant_id);
CREATE INDEX idx_variant_female_chr    ON variant_female(chr);
CREATE INDEX idx_variant_female_bp     ON variant_female(bp);
CREATE INDEX idx_variant_female_snp    ON variant_female(snp);
CREATE INDEX idx_variant_female_p      ON variant_female(p);
CREATE INDEX idx_variant_female_nlog_p ON variant_female(nlog_p);
CREATE INDEX idx_variant_female_query  ON variant_female(chr, bp, nlog_p);

CREATE INDEX idx_aggregate_female_chr           ON aggregate_female(chr);
CREATE INDEX idx_aggregate_female_bp_abs_1000kb ON aggregate_female(bp_abs_1000kb);
CREATE INDEX idx_aggregate_female_nlog_p2       ON aggregate_female(nlog_p2);
CREATE INDEX idx_aggregate_female_query         ON aggregate_female(chr, bp_abs_1000kb, nlog_p2);


CREATE INDEX idx_variant_male_id     ON variant_male(variant_id);
CREATE INDEX idx_variant_male_chr    ON variant_male(chr);
CREATE INDEX idx_variant_male_bp     ON variant_male(bp);
CREATE INDEX idx_variant_male_snp    ON variant_male(snp);
CREATE INDEX idx_variant_male_p      ON variant_male(p);
CREATE INDEX idx_variant_male_nlog_p ON variant_male(nlog_p);
CREATE INDEX idx_variant_male_query  ON variant_male(chr, bp, nlog_p);

CREATE INDEX idx_aggregate_male_chr           ON aggregate_male(chr);
CREATE INDEX idx_aggregate_male_bp_abs_1000kb ON aggregate_male(bp_abs_1000kb);
CREATE INDEX idx_aggregate_male_nlog_p2       ON aggregate_male(nlog_p2);
CREATE INDEX idx_aggregate_male_query         ON aggregate_male(chr, bp_abs_1000kb, nlog_p2);