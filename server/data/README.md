#### Gene Data

1. Navigate to UCSC Genome Table Browser (https://genome.ucsc.edu)
2. Select assembly: Dec. 2013 (GRCh38/hg38)
3. Select track: NCBI RefSeq
4. Select table: RefSeq All (ncbiRefSeq)
5. Select region: genome
6. Schema is shown below (only **bold** fields are imported)

| field            | example            | SQL type                              | info   | description                                                             |
|------------------|--------------------|---------------------------------------|--------|-------------------------------------------------------------------------|
| bin              | 585                | smallint(5) unsigned                  | range  | Indexing field to speed chromosome range queries.                       |
| **name**         | NR_046018.2        | varchar(255)                          | values | Name of gene (usually transcript_id from GTF)                           |
| **chrom**        | chr1               | varchar(255)                          | values | Reference sequence chromosome or scaffold                               |
| **strand**       | +                  | char(1)                               | values | + or - for strand                                                       |
| **txStart**      | 11873              | int(10) unsigned                      | range  | Transcription start position (or end position for minus strand item)    |
| **txEnd**        | 14409              | int(10) unsigned                      | range  | Transcription end position (or start position for minus strand item)    |
| cdsStart         | 14409              | int(10) unsigned                      | range  | Coding region start (or end position for minus strand item)             |
| cdsEnd           | 14409              | int(10) unsigned                      | range  | Coding region end (or start position for minus strand item)             |
| exonCount        | 3                  | int(10) unsigned                      | range  | Number of exons                                                         |
| **exonStarts**   | 11873,12612,13220, | longblob                              |        | Exon start positions (or end positions for minus strand item)           |
| **exonEnds**     | 12227,12721,14409, | longblob                              |        | Exon end positions (or start positions for minus strand item)           |
| score            | 0                  | int(11)                               | range  | score                                                                   |
| **name2**        | DDX11L1            | varchar(255)                          | values | Alternate name (e.g. gene_id from GTF)                                  |
| cdsStartStat     | none               | enum('none', 'unk', 'incmpl', 'cmpl') | values | Status of CDS start annotation (none, unknown, incomplete, or complete) |
| cdsEndStat       | none               | enum('none', 'unk', 'incmpl', 'cmpl') | values | Status of CDS end annotation (none, unknown, incomplete, or complete)   |
| exonFrames       | -1,-1,-1,          | longblob                              |        | Exon frame {0,1,2}, or -1 if no frame for exon                          |

##### Importing Gene Data

1. Download gene data as a csv file (eg: gene.csv) following the instructions above
2. Run the `server/scripts/import-genes.js` script:
   ```sh
    cd server
    node scripts/import-genes.js data/gene.txt data/gene.dd
   ```
3. Note: exons are collapsed according to gene name

##### Querying Gene Data

1. Start the application server: `npm start`
2. Access gene transcription/exon indexes using the following query parameters:
   - database
   - chr
   - txStart
   - txEnd
3. For example:
    ```sh
    curl localhost:9000/genes?database=gene.db&chr=1&txStart=0&txEnd=1e6
    ```