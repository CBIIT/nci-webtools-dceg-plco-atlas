CREATE TABLE correlations_stage
(
    "phenotype1_title"      TEXT,
    "phenotype1_value"      TEXT,
    "phenotype2_title"      TEXT,
    "phenotype2_value"      TEXT,
    "r2"                    REAL
);

CREATE TABLE correlations
(
    "correlations_id"       INTEGER PRIMARY KEY,
    "phenotype1_title"      TEXT,
    "phenotype1_value"      TEXT,
    "phenotype2_title"      TEXT,
    "phenotype2_value"      TEXT,
    "r2"                    REAL
);