CREATE TABLE correlations_stage
(
    "phenotype1"    TEXT,
    "phenotype2"    TEXT,
    "r2"            REAL
);

CREATE TABLE correlations
(
    "variant_id"    INTEGER PRIMARY KEY,
    "phenotype1"    TEXT,
    "phenotype2"    TEXT,
    "r2"            REAL
);