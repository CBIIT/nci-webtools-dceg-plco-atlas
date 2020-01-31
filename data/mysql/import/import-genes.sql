START TRANSACTION
SET sql_mode = '' --  // disable only_full_group_by
SET autocommit = 0
ALTER TABLE gene DISABLE KEYS
TRUNCATE gene;

select * from gene
CREATE TEMPORARY TABLE gene_stage (
    `bin`           MEDIUMTEXT,
    `name`          MEDIUMTEXT,
    `chrom`         MEDIUMTEXT,
    `strand`        MEDIUMTEXT,
    `txStart`       MEDIUMTEXT,
    `txEnd`         MEDIUMTEXT,
    `cdsStart`      MEDIUMTEXT,
    `cdsEnd`        MEDIUMTEXT,
    `exonCount`     MEDIUMTEXT,
    `exonStarts`    MEDIUMTEXT,
    `exonEnds`      MEDIUMTEXT,
    `score`         MEDIUMTEXT,
    `name2`         MEDIUMTEXT,
    `cdsStartStat`  MEDIUMTEXT,
    `cdsEndStat`    MEDIUMTEXT,
    `exonFrames`    MEDIUMTEXT
);

LOAD DATA LOCAL INFILE "raw/genes.tsv" INTO TABLE gene_stage
    FIELDS TERMINATED BY '\t'
    IGNORE 1 ROWS;

-- trim chromosome names
UPDATE gene_stage SET chrom = replace(chrom, 'chr', '');

INSERT INTO gene
SELECT
    null,
    name,
    chrom as chromosome,
    strand,
    MIN(txStart) as transcription_start,
    MAX(txEnd) as transcription_end,
    GROUP_CONCAT(exonStarts, '') as exon_starts,
    GROUP_CONCAT(exonEnds, '') as exon_ends
FROM gene_stage
WHERE CAST(chrom AS UNSIGNED) BETWEEN 1 AND 22
GROUP BY name
ORDER BY chromosome, transcription_start, transcription_end;

DROP TEMPORARY TABLE gene_stage;
ALTER TABLE gene ENABLE KEYS;
COMMIT;

SELECT * FROM gene;