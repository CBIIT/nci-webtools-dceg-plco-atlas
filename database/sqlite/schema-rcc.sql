CREATE TABLE variant_stage
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

CREATE TABLE variant
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

CREATE TABLE variant_summary
(
    "chr"           INTEGER,
    "bp_abs_1000kb" INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "nlog_p2"       REAL -- negative log10(P) floored to the nearest multiple of 10^-2
);