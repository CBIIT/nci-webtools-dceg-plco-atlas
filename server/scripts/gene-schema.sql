CREATE TABLE gene
(
    "gene_id"     INTEGER PRIMARY KEY,
    "name"        TEXT,
    "chr"         INTEGER,
    "strand"      TEXT,
    "tx_start"    INTEGER,
    "tx_end"      INTEGER,
    "exon_starts" TEXT,
    "exon_ends"   TEXT,
    "protein_id"  TEXT,
    "align_id"    TEXT
);
