-- add chromosome ranges
TRUNCATE chromosome_range;
ALTER TABLE chromosome_range AUTO_INCREMENT = 1;
INSERT INTO chromosome_range (`chromosome`, `position_min`, `position_max`, `position_abs_min`, `position_abs_max`) VALUES
('1', 0, 249698942, 0, 249698942),
('2', 0, 242508799, 249698942, 492207741),
('3', 0, 198450956, 492207741, 690658697),
('4', 0, 190424264, 690658697, 881082961),
('5', 0, 181630948, 881082961, 1062713909),
('6', 0, 170805979, 1062713909, 1233519888),
('7', 0, 159345973, 1233519888, 1392865861),
('8', 0, 145138636, 1392865861, 1538004497),
('9', 0, 138688728, 1538004497, 1676693225),
('10', 0, 133797422, 1676693225, 1810490647),
('11', 0, 135186938, 1810490647, 1945677585),
('12', 0, 133275309, 1945677585, 2078952894),
('13', 0, 114364328, 2078952894, 2193317222),
('14', 0, 108136338, 2193317222, 2301453560),
('15', 0, 102439437, 2301453560, 2403892997),
('16', 0, 92211104, 2403892997, 2496104101),
('17', 0, 83836422, 2496104101, 2579940523),
('18', 0, 80373285, 2579940523, 2660313808),
('19', 0, 58617616, 2660313808, 2718931424),
('20', 0, 64444167, 2718931424, 2783375591),
('21', 0, 46709983, 2783375591, 2830085574),
('22', 0, 51857516, 2830085574, 2881943090),
('X', 0, 156040895, 2881943090, 3037983985),
('Y', 0, 57264655, 3037983985, 3095248640);


-- add phenotypes
-- generated with:

-- // 0. Flatten tree
-- const roots = [/* phenotypes.json */]
-- let leaves = []
-- addLeaves = node => { leaves.push(node); (node.children || []).forEach(addLeaves) }
-- roots.forEach(addLeaves);

-- // 1. add ids
-- let a = leaves.map((l, i) => ({ ...l, id: i + 1 }))

-- // 2. add parent ids
-- let b = a.map(e => {
--   let parent = a.find(par => (par.children || []).find(child => child.value == e.value));
--   return {...e, parent_id: parent ? parent.id : null}
-- });

-- // 3. normalize names
-- let c = b.map(e => ({
--   id: e.id,
--   parent_id: e.parent_id,
--   display_name: e.title,
--   name: e.title
--     .replace(/['’]/g, '')
--     .replace(/[^a-z0-9]+/gi, '_')
--     .replace(/_*$/, '')
--     .toLowerCase()
-- }))

-- // 4. generate sql values
-- let d = c.map(e => `(${e.id}, ${e.parent_id}, '${e.name}', '${e.display_name}')`).join(',\n')
TRUNCATE phenotype;
ALTER TABLE phenotype AUTO_INCREMENT = 1;
INSERT INTO phenotype (`id`, `parent_id`, `name`, `display_name`) VALUES
(1, null, 'test_1', 'Test'),
(2, 1, 'ewings_sarcoma_2', 'Ewing''s sarcoma'),
(3, 1, 'melanoma_3', 'Melanoma'),
(4, 1, 'renal_cell_carcinoma_4', 'Renal Cell Carcinoma'),
(5, null, 'anthropometric_measures_5', 'Anthropometric measures'),
(6, 5, 'height_6', 'Height'),
(7, 6, 'height_when_standing_7', 'Height when standing'),
(8, 6, 'height_when_sitting_8', 'Height when sitting'),
(9, 5, 'weight_9', 'Weight'),
(10, 9, 'bmi_10', 'BMI'),
(11, 9, 'weight_gain_area_11', 'Weight Gain Area'),
(12, 9, 'weight_loss_area_12', 'Weight Loss Area'),
(13, 9, 'waist_hip_comparison_13', 'Waist-Hip Comparison'),
(14, 5, 'hair_pattern_at_45_14', 'Hair pattern at 45'),
(15, null, 'cancer_15', 'Cancer'),
(16, 15, 'by_location_16', 'By location'),
(17, 16, 'biliary_cancer_17', 'Biliary cancer'),
(18, 16, 'bladder_cancer_18', 'Bladder cancer'),
(19, 16, 'breast_cancer_19', 'Breast cancer'),
(20, 19, 'breast_cancer_lobular_20', 'Breast cancer (lobular)'),
(21, 19, 'breast_cancer_er_positive_21', 'Breast cancer (ER positive)'),
(22, 19, 'breast_cancer_pr_positive_22', 'Breast cancer (PR positive)'),
(23, 19, 'breast_cancer_er_pr_negative_23', 'Breast cancer (ER/PR negative)'),
(24, 19, 'breast_cancer_tubular_24', 'Breast cancer (tubular)'),
(25, 16, 'colorectal_cancer_25', 'Colorectal cancer'),
(26, 25, 'colon_cancer_distal_26', 'Colon cancer (distal)'),
(27, 25, 'colon_cancer_proximal_27', 'Colon cancer (proximal)'),
(28, 25, 'colorectal_cancer_adenocarcinoma_28', 'Colorectal cancer (adenocarcinoma)'),
(29, 25, 'colorectal_cancer_advanced_29', 'Colorectal cancer (advanced)'),
(30, 25, 'rectal_cancer_30', 'Rectal cancer'),
(31, 16, 'endometrial_cancer_31', 'Endometrial cancer'),
(32, 16, 'glioma_cancer_32', 'Glioma cancer'),
(33, 16, 'head_and_neck_cancer_33', 'Head and neck cancer'),
(34, 16, 'hematologic_malignancies_34', 'Hematologic malignancies'),
(35, 34, 'hodgkin_lymphoma_35', 'Hodgkin lymphoma'),
(36, 34, 'lymphocytic_leukemia_36', 'Lymphocytic leukemia'),
(37, 34, 'myeloid_monocytic_leukemia_37', 'Myeloid/Monocytic leukemia'),
(38, 34, 'myeloma_38', 'Myeloma'),
(39, 34, 'non_hodgkin_lymphoma_39', 'Non-Hodgkin lymphoma'),
(40, 16, 'liver_cancer_40', 'Liver cancer'),
(41, 16, 'lung_cancer_41', 'Lung cancer'),
(42, 41, 'lung_cancer_small_cell_42', 'Lung cancer (small cell)'),
(43, 41, 'lung_cancer_adenocarcinoma_43', 'Lung cancer (adenocarcinoma)'),
(44, 41, 'lung_cancer_squamous_cell_44', 'Lung cancer (squamous cell)'),
(45, 16, 'melanoma_45', 'Melanoma'),
(46, 16, 'non_melanoma_skin_cancer_46', 'Non-melanoma skin cancer'),
(47, 46, 'basal_cell_only_47', 'Basal cell only'),
(48, 46, 'basal_and_squamous_cell_48', 'Basal and squamous cell'),
(49, 46, 'squamous_cell_only_49', 'Squamous cell only'),
(50, 16, 'ovarian_cancer_50', 'Ovarian cancer'),
(51, 16, 'pancreatic_cancer_51', 'Pancreatic cancer'),
(52, 16, 'prostate_cancer_52', 'Prostate cancer'),
(53, 52, 'prostate_cancer_advanced_53', 'Prostate cancer (advanced)'),
(54, 52, 'prostate_cancer_not_advanced_54', 'Prostate cancer (not advanced)'),
(55, 16, 'renal_cancer_55', 'Renal cancer'),
(56, 16, 'thyroid_cancer_56', 'Thyroid cancer'),
(57, 16, 'upper_gi_cancer_57', 'Upper GI cancer'),
(58, 57, 'esophageal_cancer_58', 'Esophageal cancer'),
(59, 57, 'gastric_cancer_59', 'Gastric cancer'),
(60, 15, 'by_pathology_60', 'By pathology'),
(61, 60, 'solid_tumors_61', 'Solid tumors'),
(62, 61, 'carcinomas_62', 'Carcinomas'),
(63, 62, 'adenocarcinomas_63', 'Adenocarcinomas'),
(64, 63, 'breast_adenocarcinoma_64', 'Breast (adenocarcinoma)'),
(65, 63, 'colorectal_cancer_adenocarcinoma_65', 'Colorectal cancer (adenocarcinoma)'),
(66, 63, 'endometrial_cancer_adenocarcinoma_66', 'Endometrial cancer (adenocarcinoma)'),
(67, 63, 'lung_cancer_adenocarcinoma_67', 'Lung cancer (adenocarcinoma)'),
(68, 63, 'pancreatic_cancer_adenocarcinoma_68', 'Pancreatic cancer (adenocarcinoma)'),
(69, 63, 'prostate_cancer_adenocarcinoma_69', 'Prostate cancer (adenocarcinoma)'),
(70, 63, 'thyroid_cancer_adenocarcinoma_70', 'Thyroid cancer (adenocarcinoma)'),
(71, 62, 'squamous_cell_cancers_71', 'Squamous cell cancers'),
(72, 71, 'esophageal_cancer_squamous_cell_72', 'Esophageal cancer (squamous cell)'),
(73, 71, 'lung_cancer_squamous_cell_73', 'Lung cancer (squamous cell)'),
(74, 62, 'urothelial_cancers_74', 'Urothelial cancers'),
(75, 74, 'bladder_cancer_urothelial_75', 'Bladder cancer (urothelial)'),
(76, 74, 'renal_cancer_urothelial_76', 'Renal cancer (urothelial)'),
(77, 62, 'sarcomas_77', 'Sarcomas'),
(78, 77, 'need_to_look_into_78', 'Need to look into'),
(79, 62, 'neuroendocrine_related_cancers_79', 'Neuroendocrine related cancers'),
(80, 79, 'lung_cancer_neuroendocrine_80', 'Lung cancer (neuroendocrine)'),
(81, 79, 'pancreatic_cancer_neuroendocrine_81', 'Pancreatic cancer (neuroendocrine)'),
(82, 79, 'thyroid_cancer_neuroendocrine_82', 'Thyroid cancer (neuroendocrine)'),
(83, 62, 'hematologic_malignancies_83', 'Hematologic malignancies'),
(84, 83, 'hodgkins_lymphoma_84', 'Hodgkin''s lymphoma'),
(85, 83, 'non_hodgkins_lymphoma_85', 'Non-Hodgkin''s lymphoma'),
(86, 83, 'multiple_myeloma_86', 'Multiple myeloma'),
(87, 62, 'by_risk_factor_87', 'By risk factor'),
(88, 87, 'smoking_related_cancers_88', 'Smoking related cancers'),
(89, 88, 'lung_cancer_89', 'Lung cancer'),
(90, 88, 'bladder_cancer_90', 'Bladder cancer'),
(91, 87, 'obesity_related_cancers_91', 'Obesity related cancers'),
(92, 91, 'breast_cancer_92', 'Breast cancer'),
(93, 91, 'colorectal_cancer_93', 'Colorectal cancer'),
(94, 91, 'esophageal_cancer_94', 'Esophageal cancer'),
(95, 91, 'kidney_cancer_95', 'Kidney cancer'),
(96, 87, 'hormone_related_cancers_96', 'Hormone-related cancers'),
(97, 96, 'breast_cancer_97', 'Breast cancer'),
(98, 96, 'endometrial_cancer_98', 'Endometrial cancer'),
(99, 96, 'ovarian_cancer_99', 'Ovarian cancer'),
(100, 96, 'prostate_cancer_100', 'Prostate cancer'),
(101, 87, 'physical_activity_related_cancers_101', 'Physical activity related cancers'),
(102, 101, 'need_to_look_into_102', 'Need to look into'),
(103, 87, 'alcohol_related_cancers_103', 'Alcohol-related cancers'),
(104, 103, 'breast_cancer_104', 'Breast cancer'),
(105, 103, 'liver_cancer_105', 'Liver cancer'),
(106, 87, 'infection_related_cancers_106', 'Infection-related cancers'),
(107, 106, 'h_pylori_cancers_107', 'H. pylori cancers'),
(108, 107, 'gastric_cancer_108', 'Gastric cancer'),
(109, 106, 'hpv_related_cancers_109', 'HPV-related cancers'),
(110, 109, 'cervical_cancer_110', 'Cervical cancer'),
(111, 109, 'head_and_neck_cancer_111', 'Head and neck cancer'),
(112, 106, 'family_history_of_cancer_112', 'Family history of cancer'),
(113, null, 'lifestyle_factors_113', 'Lifestyle factors'),
(114, 113, 'alcohol_consumption_114', 'Alcohol consumption'),
(115, 113, 'diet_115', 'Diet'),
(116, 115, 'caffeine_intake_116', 'Caffeine intake'),
(117, 115, 'fat_intake_117', 'Fat intake'),
(118, 115, 'protein_intake_118', 'Protein intake'),
(119, 113, 'exercise_119', 'Exercise'),
(120, 119, 'flights_of_stairs_120', 'Flights of stairs'),
(121, 119, 'light_activity_duration_121', 'Light activity duration'),
(122, 119, 'mile_walk_frequency_122', 'Mile walk frequency'),
(123, 119, 'moderate_activity_duration_123', 'Moderate activity duration'),
(124, 119, 'strenuous_activity_frequency_124', 'Strenuous activity frequency'),
(125, 119, 'strenuous_activity_duration_125', 'Strenuous activity duration'),
(126, 119, 'vigorous_activity_at_40_126', 'Vigorous activity at 40'),
(127, 119, 'vigorous_activity_current_127', 'Vigorous activity current'),
(128, 119, 'walking_pace_128', 'Walking pace'),
(129, 113, 'smoking_129', 'Smoking'),
(130, 129, 'cigarette_smoking_status_130', 'Cigarette smoking status'),
(131, 129, 'cigarette_type_131', 'Cigarette type'),
(132, 129, 'cigarettes_per_day_132', 'Cigarettes per day'),
(133, 129, 'experience_cigarette_cravings_133', 'Experience cigarette cravings'),
(134, 129, 'filtered_or_non_filtered_134', 'Filtered or Non-filtered'),
(135, 129, 'menthol_or_non_menthol_135', 'Menthol or non-menthol'),
(136, 129, 'number_of_cigarettes_smoked_per_day_136', 'Number of cigarettes smoked per day'),
(137, 129, 'wake_up_smoke_137', 'Wake up smoke'),
(138, null, 'medical_conditions_138', 'Medical conditions'),
(139, 138, 'arthritis_139', 'Arthritis'),
(140, 138, 'asthma_140', 'Asthma'),
(141, 138, 'benign_ovarian_cyst_tumor_141', 'Benign ovarian cyst/tumor'),
(142, 138, 'broken_bone_142', 'Broken bone'),
(143, 142, 'broken_arm_143', 'Broken arm'),
(144, 142, 'broken_hip_144', 'Broken hip'),
(145, 142, 'broken_vertebra_145', 'Broken vertebra'),
(146, 142, 'broken_other_146', 'Broken other'),
(147, 138, 'bronchitis_147', 'Bronchitis'),
(148, 138, 'cirrhosis_148', 'Cirrhosis'),
(149, 138, 'colorectal_polyps_149', 'Colorectal polyps'),
(150, 138, 'crohns_disease_150', 'Crohn''s disease'),
(151, 138, 'diabetes_151', 'Diabetes'),
(152, 138, 'diverticulitis_diverticulosis_152', 'Diverticulitis/Diverticulosis'),
(153, 138, 'emphysema_153', 'Emphysema'),
(154, 138, 'endometriosis_154', 'Endometriosis'),
(155, 138, 'enlarged_prostate_of_bph_155', 'Enlarged prostate of BPH'),
(156, 138, 'fibrotic_breast_disease_156', 'Fibrotic breast disease'),
(157, 138, 'gallbladder_stones_or_inflammation_157', 'Gallbladder stones or inflammation'),
(158, 138, 'heart_attack_158', 'Heart attack'),
(159, 138, 'hepatitis_159', 'Hepatitis'),
(160, 138, 'high_cholesterol_160', 'High cholesterol'),
(161, 138, 'hypertension_161', 'Hypertension'),
(162, 138, 'inflamed_prostate_162', 'Inflamed prostate'),
(163, 138, 'osteoporosis_163', 'Osteoporosis'),
(164, 138, 'stroke_164', 'Stroke'),
(165, 138, 'ulcerative_colitis_165', 'Ulcerative colitis'),
(166, 138, 'uterine_fibroid_tumors_166', 'Uterine fibroid tumors'),
(167, null, 'reproductive_factors_167', 'Reproductive factors'),
(168, 167, 'age_of_menarche_168', 'Age of menarche'),
(169, 167, 'age_of_menopause_169', 'Age of menopause'),
(170, 167, 'ever_try_to_become_pregnant_without_success_170', 'Ever try to become pregnant without success'),
(171, null, 'mortality_171', 'Mortality'),
(172, 171, 'all_cause_mortality_172', 'All-cause mortality'),
(173, 171, 'cancer_specific_mortality_173', 'Cancer-specific mortality');

-- add correlations

-- generated with:
-- let corrs = processCorrelations({/* sample_correlations.json */}, d);
-- let sql = corrs.map((e, i) => `(${i + 1}, ${e.a}, ${e.b}, ${e.value})`).join(',\n')
--
-- function processCorrelations(correlations, lookupTable) {
--   var normalized = {};
--   var normalize = str => str.replace(/['’]/g, '')
--     .replace(/[^a-z0-9]+/gi, '_')
--     .replace(/_*$/, '')
--     .toLowerCase()
--
--   // normalize names
--   for (let key in correlations) {
--     let newValue = {};
--     for (let subkey in correlations[key])
--       newValue[normalize(subkey)] = correlations[key][subkey]
--     normalized[normalize(key)] = newValue
--   }
--
--   // convert names to list
--   let list = [];
--   let findPhenotype = name => lookupTable.find(e => e.name === name)
--   for (let key in normalized) {
--     let value = normalized[key];
--     let phenotypeA = findPhenotype(key);
--     if (!phenotypeA) continue;
--     for (let subkey in value) {
--       let phenotypeB = findPhenotype(subkey);
--       if (!phenotypeB) continue;
--       list.push({a: phenotypeA.id, b: phenotypeB.id, value: value[subkey]})
--     }
--   }
--   return list;
-- }

TRUNCATE phenotype_correlation;
ALTER TABLE phenotype_correlation AUTO_INCREMENT = 1;
INSERT INTO phenotype_correlation (`phenotype_a`, `phenotype_b`, `value`) VALUES
(17, 17, 1),
(18, 17, -0.892871647),
(18, 18, 1),
(19, 17, 0.996631204),
(19, 18, -0.920079721),
(19, 19, 1),
(20, 17, 0.996631204),
(20, 18, -0.920079721),
(20, 19, 1),
(20, 20, 1),
(24, 17, 0.052861451),
(24, 18, -0.035015514),
(24, 19, 0.038273277),
(24, 20, 0.038273277),
(24, 24, 1),
(21, 17, 0.984882178),
(21, 18, -0.870901212),
(21, 19, 0.975593934),
(21, 20, 0.975593934),
(21, 24, -0.045400312),
(21, 21, 1),
(22, 17, 0.945225644),
(22, 18, -0.882902916),
(22, 19, 0.962312328),
(22, 20, 0.962312328),
(22, 24, 0.009207712),
(22, 21, 0.895451981),
(22, 22, 1);