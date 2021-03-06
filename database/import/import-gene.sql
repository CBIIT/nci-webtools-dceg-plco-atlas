START TRANSACTION;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

-- disable only_full_group_by
SET sql_mode = '';

-- maximum length for output from group_concat()
SET group_concat_max_len = 4294967295;

SET autocommit = 0;

-- recreate gene table
TRUNCATE gene;

-- create staging table
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
    `exonEnds`      TEXT,
    `score`         TEXT,
    `name2`         TEXT
);

-- load data into staging table
LOAD DATA LOCAL INFILE "../raw/genes.tsv" INTO TABLE gene_stage
    FIELDS TERMINATED BY '\t'
    IGNORE 1 ROWS
    (
      bin,
      name,
      chrom,
      strand,
      txStart,
      txEnd,
      cdsStart,
      cdsEnd,
      exonCount,
      exonStarts,
      exonEnds,
      score,
      name2,
      @dummy,
      @dummy,
      @dummy
    );

-- trim chromosome names in staging table
UPDATE gene_stage SET chrom = replace(chrom, 'chr', '');

-- filter genes by chromosome and insert into gene table
INSERT INTO gene
SELECT
    null,
    COALESCE(name2, name),
    ANY_VALUE(chrom) as chromosome,
    ANY_VALUE(strand),
    MIN(txStart) as transcription_start,
    MAX(txEnd) as transcription_end,
    GROUP_CONCAT(exonStarts, '') as exon_starts,
    GROUP_CONCAT(exonEnds, '') as exon_ends
FROM gene_stage
WHERE chrom IN (SELECT chromosome FROM chromosome_range)
GROUP BY name2
ORDER BY chromosome, transcription_start, transcription_end;

DROP TEMPORARY TABLE gene_stage;

COMMIT;