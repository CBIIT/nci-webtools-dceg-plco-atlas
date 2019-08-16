CREATE TABLE variant_stage
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

CREATE TABLE variant
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

CREATE TABLE variant_summary
(
    "chr"           INTEGER,
    "bp_abs_1000kb" INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
    "nlog_p2"       REAL -- negative log10(P) floored to the nearest multiple of 10^-2
);