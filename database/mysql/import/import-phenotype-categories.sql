TRUNCATE phenotype_category;
ALTER TABLE phenotype_category AUTO_INCREMENT = 1;

INSERT INTO phenotype_category (`phenotype_id`, `value`, `label`) VALUES
    -- height when sitting
    (8, 1, 'Especially Tall'),
    (8, 2, 'Somewhat Tall'),
    (8, 3, 'Typical'),
    (8, 4, 'Somewhat Short'),
    (8, 5, 'Especially Short')

    -- waist hip comparison
    (13, 1, 'Waist much Smaller than Hips'),
    (13, 2, 'Waist Somewhat Smaller than Hips'),
    (13, 3, 'Waist Similar to Hips'),
    (13, 4, 'Waist Somewhat Larger than Hips'),
    (13, 5, 'Waist much Larger than Hips');
