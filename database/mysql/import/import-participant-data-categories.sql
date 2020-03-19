TRUNCATE phenotype_category;
ALTER TABLE phenotype_category AUTO_INCREMENT = 1;

INSERT INTO participant_data_category (`phenotype_id`, `value`, `label`) VALUES
    -- height when sitting
    (196, 1, 'Especially Tall'),
    (196, 2, 'Somewhat Tall'),
    (196, 3, 'Typical'),
    (196, 4, 'Somewhat Short'),
    (196, 5, 'Especially Short'),

    -- waist hip comparison
    (14, 1, 'Waist much Smaller than Hips'),
    (14, 2, 'Waist Somewhat Smaller than Hips'),
    (14, 3, 'Waist Similar to Hips'),
    (14, 4, 'Waist Somewhat Larger than Hips'),
    (14, 5, 'Waist much Larger than Hips');
