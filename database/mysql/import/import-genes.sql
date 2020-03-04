START TRANSACTION;

-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

-- disable only_full_group_by
SET sql_mode = '';

-- maximum length for output from group_concat()
SET group_concat_max_len = 4294967295;

SET autocommit = 0;

-- recreate gene table
DROP TABLE IF EXISTS gene;
CREATE TABLE gene (
    `id`                    INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(200) NOT NULL,
    `chromosome`            VARCHAR(2) NOT NULL,
    `strand`                CHAR NOT NULL,
    `transcription_start`   INTEGER NOT NULL,
    `transcription_end`     INTEGER NOT NULL,
    `exon_starts`           MEDIUMTEXT,
    `exon_ends`             MEDIUMTEXT
);

-- create staging table
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
      @dummy,
      @dummy,
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

-- add indexes
ALTER TABLE gene
    ADD INDEX (chromosome),
    ADD INDEX (transcription_start),
    ADD INDEX (transcription_end);

COMMIT;