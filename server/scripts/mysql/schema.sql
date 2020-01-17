CREATE TABLE variant
(
    "variant_id"    BIGINT PRIMARY KEY,
    "gender"        ENUM('all', 'female', 'female'),
    "chr"           VARCHAR(2),
    "bp"            BIGINT,
    "snp"           VARCHAR(200),
    "a1"            VARCHAR(200),
    "a2"            VARCHAR(200),
    "n"             BIGINT,
    "p"             DOUBLE,
    "expected_p"    DOUBLE,
    "nlog_p"        DOUBLE, -- negative log10(P)
    "p_r"           DOUBLE,
    "or"            DOUBLE,
    "or_r"          DOUBLE,
    "q"             DOUBLE,
    "i"             DOUBLE,
    "plot_qq"       BOOLEAN
);

CREATE TABLE variant_group
(
    "variant_group_id"  BIGINT PRIMARY KEY,
    "bp"                BIGINT,
    "bp_abs"            BIGINT
    "nlog_p"            DOUBLE,
    "gender"            ENUM('all', 'female', 'male'),
)

CREATE TABLE phenotype
(
    "phenotype_id"  INTEGER PRIMARY KEY,
    "parent_id"     INTEGER FOREIGN KEY fk_parent_phenotype_id REFERENCES phenotype(phenotype_id),
    "name"          VARCHAR(200)
);

create table correlation
(
    "phenotype_a"   INTEGER FOREIGN KEY fk_phenotype_a REFERENCES phenotype(phenotype_id),
    "phenotype_b"   INTEGER FOREIGN KEY fk_phenotype_a REFERENCES phenotype(phenotype_id),
    "value"         DOUBLE
);

CREATE TABLE metadata
(
    "metadata_id"   INTEGER PRIMARY KEY,
    "phenotype_id"  INTEGER FOREIGN KEY fk_phenotype_id REFERENCES phenotype(phenotype_id),
    "key"           VARCHAR(200),
    "subkey"        VARCHAR(200),
    "value"         VARCHAR(2000),
);

CREATE TABLE gene
(
    "gene_id"      INTEGER PRIMARY KEY,
    "name"         VARCHAR(200),
    "chr"          VARCHAR(2),
    "strand"       CHAR,
    "tx_start"     INTEGER,
    "tx_end"       INTEGER,
    "exon_starts"  VARCHAR(100000),
    "exon_ends"    VARCHAR(100000)
);
