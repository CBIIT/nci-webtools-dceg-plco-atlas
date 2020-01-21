-- RCC (Renal Cell Carcinoma)
CREATE TABLE variant_RCC_stage
(
    "snp"                           TEXT,
    "chr"                           INTEGER,
    "bp"                            INTEGER,
    "bp_1000kb"                     INTEGER, -- BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "bp_abs"                        INTEGER, -- The absolute position from the beginning of the genome (used for plotting)
    "bp_abs_1000kb"                 INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "a1"                            TEXT,
    "a2"                            TEXT,
    "p"                             REAL,
    "nlog_p"                        REAL, -- negative log10(P)
    "nlog_p2"                       REAL, -- negative log10(P) floored to the nearest multiple of 10^-2
    "or"                            REAL,
    "i2"                            REAL,
    "group"                         TEXT,
    "category"                      TEXT,
    "info"                          TEXT,
    "num_control"                   INTEGER,
    "num_case"                      INTEGER,
    "effect_allele_freq_control"    REAL,
    "effect_allele_freq_case"       REAL,
    "ci"                            TEXT,
    "phet"                          TEXT
);
CREATE TABLE variant_RCC
(
    "variant_id"    INTEGER PRIMARY KEY,
    "chr"           INTEGER,
    "bp"            INTEGER,
    "snp"           TEXT,
    "a1"            TEXT,
    "a2"            TEXT,
    "p"             REAL,
    "nlog_p"        REAL, -- negative log10(P)
    "or"            REAL,
    "i2"            REAL
);
CREATE TABLE aggregate_RCC
(
    "chr"           INTEGER,
    "bp_abs_1000kb" INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "nlog_p2"       REAL -- negative log10(P) floored to the nearest multiple of 10^-2
);

-- MEL (Melanoma)
CREATE TABLE variant_MEL_stage
(
    "chr"                           INTEGER,
    "bp"                            INTEGER,
    "bp_1000kb"                     INTEGER, -- BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "bp_abs"                        INTEGER, -- The absolute position from the beginning of the genome (used for plotting)
    "bp_abs_1000kb"                 INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "snp"                           TEXT,
    "a1"                            TEXT,
    "a2"                            TEXT,
    "n"                             INTEGER,
    "p"                             REAL,
    "nlog_p"                        REAL, -- negative log10(P)
    "nlog_p2"                       REAL, -- negative log10(P) floored to the nearest multiple of 10^-2
    "pr"                            REAL,
    "or"                            REAL,
    "orr"                           REAL,
    "q"                             REAL,
    "i"                             REAL,
    "case_n"                        INTEGER,
    "control_n"                     INTEGER,
    "sample_n"                      INTEGER,
    "se_fixed"                      REAL,
    "z_fixed"                       REAL,
    "rsid"                          TEXT
);

CREATE TABLE variant_MEL
(
    "variant_id"    INTEGER PRIMARY KEY,
    "chr"           INTEGER,
    "bp"            INTEGER,
    "snp"           TEXT,
    "a1"            TEXT,
    "a2"            TEXT,
    "n"             INTEGER,
    "p"             REAL,
    "nlog_p"        REAL, -- negative log10(P)
    "p_r"           REAL,
    "or"            REAL,
    "or_r"          REAL,
    "q"             REAL,
    "i"             REAL
);

CREATE TABLE aggregate_MEL
(
    "chr"           INTEGER,
    "bp_abs_1000kb" INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "nlog_p2"       REAL -- negative log10(P) floored to the nearest multiple of 10^-2
);

-- EWING (Ewing's Sarcoma)
CREATE TABLE variant_EWING_stage
(
    "chr"           INTEGER,
    "bp"            INTEGER,
    "bp_1000kb"     INTEGER, -- BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "bp_abs"        INTEGER, -- The absolute position from the beginning of the genome (used for plotting)
    "bp_abs_1000kb" INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "snp"           TEXT,
    "a1"            TEXT,
    "a2"            TEXT,
    "n"             INTEGER,
    "p"             REAL,
    "nlog_p"        REAL, -- negative log10(P)
    "nlog_p2"       REAL, -- negative log10(P) floored to the nearest multiple of 10^-2
    "p_r"           REAL,
    "or"            REAL,
    "or_r"          REAL,
    "q"             REAL,
    "i"             REAL
);
CREATE TABLE variant_EWING
(
    "variant_id"    INTEGER PRIMARY KEY,
    "chr"           INTEGER,
    "bp"            INTEGER,
    "snp"           TEXT,
    "a1"            TEXT,
    "a2"            TEXT,
    "n"             INTEGER,
    "p"             REAL,
    "nlog_p"        REAL, -- negative log10(P)
    "p_r"           REAL,
    "or"            REAL,
    "or_r"          REAL,
    "q"             REAL,
    "i"             REAL
);
CREATE TABLE aggregate_EWING
(
    "chr"           INTEGER,
    "bp_abs_1000kb" INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "nlog_p2"       REAL -- negative log10(P) floored to the nearest multiple of 10^-2
);