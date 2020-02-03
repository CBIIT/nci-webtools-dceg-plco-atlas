START TRANSACTION;
-- SET sql_mode = ''; --  // disable only_full_group_by
SET autocommit = 0;

-- clear gene table and drop indexes (faster insertion)
TRUNCATE gene;
call drop_index_if_exists('gene', 'idx_gene__chromosome');
call drop_index_if_exists('gene', 'idx_gene__transcription_start');
call drop_index_if_exists('gene', 'idx_gene__transcription_end');

-- recreate staging table
DROP TEMPORARY TABLE IF EXISTS gene_stage;
CREATE TEMPORARY TABLE gene_stage (
    `bin`           TEXT,
    `name`          TEXT,
    `chrom`         TEXT,
    `strand`        CHAR(1),
    `txStart`       INTEGER,
    `txEnd`         INTEGER,
    `cdsStart`      INTEGER,
    `cdsEnd`        INTEGER,
    `exonCount`     INTEGER,
    `exonStarts`    TEXT,
    `exonEnds`      TEXT
);

-- load data into staging table
LOAD DATA LOCAL INFILE "raw/genes.tsv" INTO TABLE gene_stage
    FIELDS TERMINATED BY '\t'
    IGNORE 1 ROWS;

-- trim chromosome names in staging table
UPDATE gene_stage SET chrom = replace(chrom, 'chr', '');

-- filter genes by chromosome and insert into gene table
INSERT INTO gene
SELECT
    null,
    name,
    ANY_VALUE(chrom) as chromosome,
    ANY_VALUE(strand),
    MIN(txStart) as transcription_start,
    MAX(txEnd) as transcription_end,
    GROUP_CONCAT(exonStarts, '') as exon_starts,
    GROUP_CONCAT(exonEnds, '') as exon_ends
FROM gene_stage
WHERE chrom IN (SELECT chromosome FROM chromosome_range)
GROUP BY name
ORDER BY chromosome, transcription_start, transcription_end;

DROP TEMPORARY TABLE gene_stage;

-- re-add indexes
ALTER TABLE gene
    ADD INDEX idx_gene__chromosome (chromosome),
    ADD INDEX idx_gene__transcription_start (transcription_start),
    ADD INDEX idx_gene__transcription_end (transcription_end);

COMMIT;