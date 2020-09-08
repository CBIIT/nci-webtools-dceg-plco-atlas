
TRUNCATE lookup_sex;
ALTER TABLE lookup_sex AUTO_INCREMENT = 1;
insert into lookup_sex (`value`) values 
    ('all'), 
    ('female'), 
    ('male'), 
    ('stacked');

TRUNCATE lookup_ancestry;
ALTER TABLE lookup_ancestry AUTO_INCREMENT = 1;
insert into lookup_ancestry (`value`) values 
    ('all'),
    ('east_asian'),
    ('european');
