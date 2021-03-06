
TRUNCATE lookup_sex;
insert into lookup_sex (`value`) values 
    ('all'), 
    ('female'), 
    ('male'), 
    ('stacked');

TRUNCATE lookup_ancestry;
insert into lookup_ancestry (`value`) values 
    ('all'),
    ('east_asian'),
    ('european');
