CREATE INDEX idx_gene_id       ON gene(gene_id);
CREATE INDEX idx_gene_name     ON gene(name);
CREATE INDEX idx_gene_chr      ON gene(chr);
CREATE INDEX idx_gene_tx_start ON gene(tx_start);
CREATE INDEX idx_gene_tx_end   ON gene(tx_end);
CREATE INDEX idx_gene_query    ON gene(chr, tx_start, tx_end);
