CREATE INDEX idx_variant_RCC_id     ON variant_RCC(variant_id);
CREATE INDEX idx_variant_RCC_chr    ON variant_RCC(chr);
CREATE INDEX idx_variant_RCC_bp     ON variant_RCC(bp);
CREATE INDEX idx_variant_RCC_snp    ON variant_RCC(snp);
CREATE INDEX idx_variant_RCC_p      ON variant_RCC(p);
CREATE INDEX idx_variant_RCC_nlog_p ON variant_RCC(nlog_p);
CREATE INDEX idx_variant_RCC_query  ON variant_RCC(chr, bp, nlog_p);

CREATE INDEX idx_aggregate_RCC_chr           ON aggregate_RCC(chr);
CREATE INDEX idx_aggregate_RCC_bp_abs_1000kb ON aggregate_RCC(bp_abs_1000kb);
CREATE INDEX idx_aggregate_RCC_nlog_p2       ON aggregate_RCC(nlog_p2);
CREATE INDEX idx_aggregate_RCC_query         ON aggregate_RCC(chr, bp_abs_1000kb, nlog_p2);


CREATE INDEX idx_variant_MEL_id     ON variant_MEL(variant_id);
CREATE INDEX idx_variant_MEL_chr    ON variant_MEL(chr);
CREATE INDEX idx_variant_MEL_bp     ON variant_MEL(bp);
CREATE INDEX idx_variant_MEL_snp    ON variant_MEL(snp);
CREATE INDEX idx_variant_MEL_p      ON variant_MEL(p);
CREATE INDEX idx_variant_MEL_nlog_p ON variant_MEL(nlog_p);
CREATE INDEX idx_variant_MEL_query  ON variant_MEL(chr, bp, nlog_p);

CREATE INDEX idx_aggregate_MEL_chr           ON aggregate_MEL(chr);
CREATE INDEX idx_aggregate_MEL_bp_abs_1000kb ON aggregate_MEL(bp_abs_1000kb);
CREATE INDEX idx_aggregate_MEL_nlog_p2       ON aggregate_MEL(nlog_p2);
CREATE INDEX idx_aggregate_MEL_query         ON aggregate_MEL(chr, bp_abs_1000kb, nlog_p2);


CREATE INDEX idx_variant_EWING_id     ON variant_EWING(variant_id);
CREATE INDEX idx_variant_EWING_chr    ON variant_EWING(chr);
CREATE INDEX idx_variant_EWING_bp     ON variant_EWING(bp);
CREATE INDEX idx_variant_EWING_snp    ON variant_EWING(snp);
CREATE INDEX idx_variant_EWING_p      ON variant_EWING(p);
CREATE INDEX idx_variant_EWING_nlog_p ON variant_EWING(nlog_p);
CREATE INDEX idx_variant_EWING_query  ON variant_EWING(chr, bp, nlog_p);

CREATE INDEX idx_aggregate_EWING_chr           ON aggregate_EWING(chr);
CREATE INDEX idx_aggregate_EWING_bp_abs_1000kb ON aggregate_EWING(bp_abs_1000kb);
CREATE INDEX idx_aggregate_EWING_nlog_p2       ON aggregate_EWING(nlog_p2);
CREATE INDEX idx_aggregate_EWING_query         ON aggregate_EWING(chr, bp_abs_1000kb, nlog_p2);