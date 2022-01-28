# Getting Started

### Quickstart

1. Create Database (eg: plcogwas)
   ```sql
        create database plcogwas
   ```    
2. Create schema, stored procedures, and indexes
   In MySQL:
   ```sql
        use plcogwas;
        source schema/tables/main.sql;
        source schema/indexes/main.sql;
        source schema/procedures/main.sql;
   ```
3. Import default data
   ```sql
        source import/import-lookup-tables.sql;
        source import/import-chromosome-range.sql;
        source import/import-gene.sql # requires raw/genes.csv;
   ```
4. Import phenotype table
   In OS shell:
   ```bash
      node import-phenotype.js
         --file "filename"
         --host "MySQL hostname" 
         --port "MySQL port" 
         --db_name "MySQL database name" 
         --user "MySQL username" 
         --password "MySQL password"
   ```
5. Import participant data
   In MySQL:
   ```sql
        source import/import-participant-data.sql; # requires raw/participant_data.tsv (renamed GSA NA dataset)
        source import/import-participant-data-category.sql; # requires raw/participant_data_category.csv
        source import-phenotype-correlation.sql; # requires ./phenotype_correlation.csv
   ```
   In OS shell:
   ```bash
      node update-participant-count.js
         --host "MySQL hostname" 
         --port "MySQL port" 
         --db_name "MySQL database name" 
         --user "MySQL username" 
         --password "MySQL password"
   ```
6. Import variant data (eg: assuming we have a file named __bq_bmi_curr_co.FASTGWA.combined.tsv__ which contains variants stratified by all genders (all/female/male) across European and East Asian ancestries)
   In OS shell:
   ```bash
      node parallel-export-combined-variant.js
        --sqlite "./sqlite3" [OPTIONAL, use PATH by default]
        --file "phenotype.sex.csv" [REQUIRED]
        --phenotype_file "./phenotype.csv" [OPTIONAL, use ./phenotype.csv by default]
        --phenotype "test_melanoma" or 10002 [OPTIONAL, use filename by default]
        --validate [REQUIRED only if phenotype name is used as identifier, implicitly set to true if only filename is given]
        --output "../raw/output" [REQUIRED]
        --tmp "/lscratch/\$SLURM_JOB_ID" [OPTIONAL, use output filepath by default]
   ```

   CSV files will be generated in the following format in the output directory: `sex.ancestry.phenotype_name.table.csv`

   To import these files into a MySQL Database:

   ```bash
      node parallel-import-combined-variant.js
            --file "path to file prefix. eg: ../raw/output/sex.ancestry.phenotype_name"
            --host "MySQL hostname" 
            --port "MySQL port" 
            --db_name "MySQL database name" 
            --user "MySQL username" 
            --password "MySQL password"
   ```

