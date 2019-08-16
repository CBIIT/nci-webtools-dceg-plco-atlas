CREATE TABLE variant_stage
(
    "SNP"                           TEXT,
    "CHR"                           INTEGER,
    "BP"                            INTEGER,
    "BP_1000KB"                     INTEGER, -- BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "BP_ABS"                        INTEGER, -- The absolute position from the beginning of the genome (used for plotting)
    "BP_ABS_1000KB"                 INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "A1"                            TEXT,
    "A2"                            TEXT,
    "P"                             REAL,
    "NLOG_P"                        REAL, -- negative log10(P)
    "NLOG_P2"                       REAL, -- negative log10(P) floored to the nearest multiple of 10^-2
    "OR"                            REAL,
    "I2"                            REAL,
    "GROUP"                         TEXT,
    "CATEGORY"                      TEXT,
    "INFO"                          TEXT,
    "NUM_CONTROL"                   INTEGER,
    "NUM_CASE"                      INTEGER,
    "EFFECT_ALLELE_FREQ_CONTROL"    REAL,
    "EFFECT_ALLELE_FREQ_CASE"       REAL,
    "CI"                            TEXT,
    "PHET"                          TEXT
);

CREATE TABLE variant
(
    "VARIANT_ID"    INTEGER PRIMARY KEY,
    "CHR"           INTEGER,
    "BP"            INTEGER,
    "SNP"           TEXT,
    "A1"            TEXT,
    "A2"            TEXT,
    "P"             REAL,
    "NLOG_P"        REAL, -- negative log10(P)
    "OR"            REAL,
    "I2"            REAL
);

CREATE TABLE variant_summary
(
    "CHR"           INTEGER,
    "BP_ABS_1000KB" INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "NLOG_P2"       REAL -- negative log10(P) floored to the nearest multiple of 10^-2
);