CREATE INDEX idx_variant_chr           ON variant(CHR);
CREATE INDEX idx_variant_bp            ON variant(BP);
CREATE INDEX idx_variant_bp_1000kb     ON variant(BP_1000KB);
CREATE INDEX idx_variant_bp_abs        ON variant(BP_ABS);
CREATE INDEX idx_variant_bp_abs_1000kb ON variant(BP_ABS_1000KB);
CREATE INDEX idx_variant_nlog_p        ON variant(NLOG_P);
CREATE INDEX idx_variant_nlog_p2       ON variant(NLOG_P2);
CREATE INDEX idx_variant_chr_bp_nlog_p ON variant(CHR, BP, NLOG_P);

CREATE INDEX idx_variant_summary_chr           ON variant_summary(CHR);
CREATE INDEX idx_variant_summary_bp_1000kb     ON variant_summary(BP_1000KB);
CREATE INDEX idx_variant_summary_bp_abs_1000kb ON variant_summary(BP_ABS_1000KB);
CREATE INDEX idx_variant_summary_nlog_p2       ON variant_summary(NLOG_P2);
CREATE INDEX idx_variant_summary_chr_bp_abs_nlog_p2 ON variant_summary(CHR, BP_ABS_1000KB, NLOG_P2);
