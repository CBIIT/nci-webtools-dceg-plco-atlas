CREATE TABLE gene_stage
(
    "name"         TEXT,
    "chr"          INTEGER,
    "strand"       TEXT,
    "tx_start"     INTEGER,
    "tx_end"       INTEGER,
    "exon_starts"  TEXT,
    "exon_ends"    TEXT
);

CREATE TABLE gene
(
    "gene_id"      INTEGER PRIMARY KEY,
    "name"         TEXT,
    "chr"          INTEGER,
    "strand"       TEXT,
    "tx_start"     INTEGER,
    "tx_end"       INTEGER,
    "exon_starts"  TEXT,
    "exon_ends"    TEXT
);
