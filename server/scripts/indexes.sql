CREATE INDEX idx_variant_id     ON variant(variant_id);
CREATE INDEX idx_variant_chr    ON variant(chr);
CREATE INDEX idx_variant_bp     ON variant(bp);
CREATE INDEX idx_variant_nlog_p ON variant(nlog_p);
CREATE INDEX idx_variant_snp    ON variant(snp);
CREATE INDEX idx_variant_query  ON variant(variant_id, chr, bp, nlog_p);

CREATE INDEX idx_variant_summary_chr           ON variant_summary(chr);
CREATE INDEX idx_variant_summary_bp_abs_1000kb ON variant_summary(bp_abs_1000kb);
CREATE INDEX idx_variant_summary_nlog_p2       ON variant_summary(nlog_p2);
CREATE INDEX idx_variant_summary_query         ON variant_summary(chr, bp_abs_1000kb, nlog_p2);
