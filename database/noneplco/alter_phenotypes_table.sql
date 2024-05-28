ALTER Table phenotype
ADD COLUMN study_id INTEGER DEFAULT 1;

ALTER TABLE phenotype
ADD CONSTRAINT fk_study_id
FOREIGN KEY (study_id) 
REFERENCES study(id);