#### Gene Data

- Navigate to UCSC Genome Table Browser (https://genome.ucsc.edu)
- Select GRCh38 assembly
- Select Gencode v32 track
- Select entire genome for region
- Schema is shown below (required fields in **bold**)

|field          |example           |SQL type         |info   |description
|---------------|------------------|-----------------|-------|--------------------------------------------------------------------
|**name**       |ENST00000619216.1 |varchar(255)     |values |Name of gene
|**chrom**      |chr1              |varchar(255)     |values |Reference sequence chromosome or scaffold
|**strand**     |-                 |char(1)          |values |+ or - for strand
|**txStart**    |17368             |int(10) unsigned |range  |Transcription start position (or end position for minus strand item)
|**txEnd**      |17436             |int(10) unsigned |range  |Transcription end position (or start position for minus strand item)
|cdsStart       |17368             |int(10) unsigned |range  |Coding region start (or end position if for minus strand item)
|cdsEnd         |17368             |int(10) unsigned |range  |Coding region end (or start position if for minus strand item)
|exonCount      |1                 |int(10) unsigned |range  |Number of exons
|**exonStarts** |17368,            |longblob         |       |Exon start positions (or end positions for minus strand item)
|**exonEnds**   |17436,            |longblob         |       |Exon end positions (or start positions for minus strand item)
|proteinID      |                  |varchar(40)      |values |UniProt display ID, UniProt accession, or RefSeq protein ID
|alignID        |uc031tla.1        |varchar(255)     |values |Unique identifier (GENCODE transcript ID for GENCODE Basic)