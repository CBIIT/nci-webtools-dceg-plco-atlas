START TRANSACTION;


-- needed if local_infile is disabled, need root privileges
-- SET GLOBAL local_infile = 'ON';

-- disable only_full_group_by
SET sql_mode = '';

-- maximum length for output from group_concat()
SET group_concat_max_len = 4294967295;

SET autocommit = 0;

-- recreate tables
DROP TABLE IF EXISTS phenotype_data_stage;
DROP TABLE IF EXISTS phenotype_data;
DROP TABLE IF EXISTS phenotype_category;
DROP TABLE IF EXISTS phenotype_sample;

CREATE TABLE `phenotype_sample` (
    `id`            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `age`           INTEGER,
    `gender`        ENUM('female', 'male', 'other'),
    `ancestry`      ENUM('american_indian', 'asian', 'black', 'hispanic', 'pacific_islander', 'white', 'other')
);

CREATE TABLE `phenotype_category` (
    `id`                    INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id`          INTEGER NOT NULL,
    `value`                 INTEGER,
    `label`                 TEXT,
    `display_distribution`  BOOLEAN,
    FOREIGN KEY (phenotype_id) REFERENCES phenotype(id)
);

CREATE TABLE `phenotype_data` (
    `id`                    BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `phenotype_id`          INTEGER NOT NULL,
    `phenotype_sample_id`   INTEGER,
    `value`                 DOUBLE,
    FOREIGN KEY (phenotype_id) REFERENCES phenotype(id),
    FOREIGN KEY (phenotype_sample_id) REFERENCES phenotype_sample(id)
);

CREATE TABLE phenotype_data_stage (
    `plco_id` TEXT,
    `j_adeno_carcinoma` TEXT,
    `j_adeno_carcinoma_fup_days` TEXT,
    `j_adeno_carcinoma_fup_age` TEXT,
    `j_adeno_carcinoma_dx_age` TEXT,
    `j_alcohol_related_dx_age` TEXT,
    `j_alcohol_related` TEXT,
    `j_alcohol_related_fup_age` TEXT,
    `j_alcohol_related_fup_days` TEXT,
    `j_bcell` TEXT,
    `j_bcell_fup_days` TEXT,
    `j_bcell_fup_age` TEXT,
    `j_bcell_dx_age` TEXT,
    `j_bili_cancer` TEXT,
    `j_bili_cancer_fup_days` TEXT,
    `j_bili_cancer_fup_age` TEXT,
    `j_bili_cancer_dx_age` TEXT,
    `j_blad_cancer` TEXT,
    `j_blad_cancer_fup_days` TEXT,
    `j_blad_cancer_fup_age` TEXT,
    `j_blad_cancer_dx_age` TEXT,
    `j_breast_cancer` TEXT,
    `j_breast_cancer_fup_days` TEXT,
    `j_breast_cancer_fup_age` TEXT,
    `j_breast_cancer_dx_age` TEXT,
    `j_breast_invasive` TEXT,
    `j_breast_insitu` TEXT,
    `j_breast_ductal` TEXT,
    `j_breast_lobular` TEXT,
    `j_breast_tubular` TEXT,
    `j_breast_er_pos_or_equiv` TEXT,
    `j_breast_er_neg` TEXT,
    `j_breast_pr_pos_or_equiv` TEXT,
    `j_breast_pr_neg` TEXT,
    `j_breast_er_or_pr_pos` TEXT,
    `j_breast_er_and_pr_neg` TEXT,
    `j_breast_her2_pos_or_equiv` TEXT,
    `j_breast_her2_neg` TEXT,
    `j_breast_er_pr_and_her2_neg` TEXT,
    `j_breast_grade34` TEXT,
    `j_breast_grade2` TEXT,
    `j_breast_grade1` TEXT,
    `j_carcinoma` TEXT,
    `j_carcinoma_fup_days` TEXT,
    `j_carcinoma_fup_age` TEXT,
    `j_carcinoma_dx_age` TEXT,
    `j_colo_cancer` TEXT,
    `j_colo_cancer_fup_days` TEXT,
    `j_colo_cancer_fup_age` TEXT,
    `j_colo_cancer_dx_age` TEXT,
    `j_colo_distal` TEXT,
    `j_colo_distal_proximal` TEXT,
    `j_colo_proximal` TEXT,
    `j_colo_rectal` TEXT,
    `j_diabetes_related_dx_age` TEXT,
    `j_diabetes_related` TEXT,
    `j_diabetes_related_fup_age` TEXT,
    `j_diabetes_related_fup_days` TEXT,
    `j_ebv_related_dx_age` TEXT,
    `j_ebv_related` TEXT,
    `j_ebv_related_fup_age` TEXT,
    `j_ebv_related_fup_days` TEXT,
    `j_endo_cancer` TEXT,
    `j_endo_cancer_fup_days` TEXT,
    `j_endo_cancer_fup_age` TEXT,
    `j_endo_cancer_dx_age` TEXT,
    `j_endo_neuro` TEXT,
    `j_endo_neuro_fup_days` TEXT,
    `j_endo_neuro_fup_age` TEXT,
    `j_endo_neuro_dx_age` TEXT,
    `j_esoph_cancer` TEXT,
    `j_esoph_cancer_fup_days` TEXT,
    `j_esoph_cancer_fup_age` TEXT,
    `j_esoph_cancer_dx_age` TEXT,
    `j_esoph_squamous` TEXT,
    `j_hbv_related_dx_age` TEXT,
    `j_hbv_related` TEXT,
    `j_hbv_related_fup_age` TEXT,
    `j_hbv_related_fup_days` TEXT,
    `j_hcv_related_dx_age` TEXT,
    `j_hcv_related` TEXT,
    `j_hcv_related_fup_age` TEXT,
    `j_hcv_related_fup_days` TEXT,
    `j_height_related_dx_age` TEXT,
    `j_height_related` TEXT,
    `j_height_related_fup_age` TEXT,
    `j_height_related_fup_days` TEXT,
    `j_helicobacter_related_dx_age` TEXT,
    `j_helicobacter_related` TEXT,
    `j_helicobacter_related_fup_age` TEXT,
    `j_helicobacter_related_fup_days` TEXT,
    `j_hematologic` TEXT,
    `j_hematologic_fup_days` TEXT,
    `j_hematologic_fup_age` TEXT,
    `j_hematologic_dx_age` TEXT,
    `j_hnc_cancer` TEXT,
    `j_hnc_cancer_fup_days` TEXT,
    `j_hnc_cancer_fup_age` TEXT,
    `j_hnc_cancer_dx_age` TEXT,
    `j_hnc_larynx` TEXT,
    `j_hnc_lip_oral_pharynx` TEXT,
    `j_hnc_naso_mid_sinus` TEXT,
    `j_hpv_related_dx_age` TEXT,
    `j_hpv_related` TEXT,
    `j_hpv_related_fup_age` TEXT,
    `j_hpv_related_fup_days` TEXT,
    `j_infection_related_dx_age` TEXT,
    `j_infection_related` TEXT,
    `j_infection_related_fup_age` TEXT,
    `j_infection_related_fup_days` TEXT,
    `j_kidney_cancer_fup_days` TEXT,
    `j_kidney_cancer_fup_age` TEXT,
    `j_kidney_cancer_dx_age` TEXT,
    `j_kidney_cancer` TEXT,
    `j_kidney_renalcell_clearcell` TEXT,
    `j_kidney_renalcell_nos` TEXT,
    `j_gast_cancer` TEXT,
    `j_gast_cancer_fup_days` TEXT,
    `j_gast_cancer_fup_age` TEXT,
    `j_gast_cancer_dx_age` TEXT,
    `j_gast_cardia` TEXT,
    `j_gast_noncardia` TEXT,
    `j_glio_cancer` TEXT,
    `j_glio_cancer_fup_days` TEXT,
    `j_glio_cancer_fup_age` TEXT,
    `j_glio_cancer_dx_age` TEXT,
    `j_liver_xintra_cancer_fup_days` TEXT,
    `j_liver_xintra_cancer_fup_age` TEXT,
    `j_liver_xintra_cancer_dx_age` TEXT,
    `j_liver_xintra_cancer` TEXT,
    `j_lung_cancer` TEXT,
    `j_lung_cancer_fup_days` TEXT,
    `j_lung_cancer_fup_age` TEXT,
    `j_lung_cancer_dx_age` TEXT,
    `j_lung_smallcell` TEXT,
    `j_lung_adeno` TEXT,
    `j_lung_squam` TEXT,
    `j_lymphoid` TEXT,
    `j_lymphoid_fup_days` TEXT,
    `j_lymphoid_fup_age` TEXT,
    `j_lymphoid_dx_age` TEXT,
    `j_cll` TEXT,
    `j_cll_fup_days` TEXT,
    `j_cll_fup_age` TEXT,
    `j_cll_dx_age` TEXT,
    `j_mbreast_cancer` TEXT,
    `j_mbreast_cancer_fup_days` TEXT,
    `j_mbreast_cancer_fup_age` TEXT,
    `j_mbreast_cancer_dx_age` TEXT,
    `j_mela_cancer` TEXT,
    `j_mela_cancer_fup_days` TEXT,
    `j_mela_cancer_fup_age` TEXT,
    `j_mela_cancer_dx_age` TEXT,
    `j_mesoth` TEXT,
    `j_mesoth_fup_days` TEXT,
    `j_mesoth_fup_age` TEXT,
    `j_mesoth_dx_age` TEXT,
    `j_myeloid` TEXT,
    `j_myeloid_fup_days` TEXT,
    `j_myeloid_fup_age` TEXT,
    `j_myeloid_dx_age` TEXT,
    `j_obesity_related_dx_age` TEXT,
    `j_obesity_related` TEXT,
    `j_obesity_related_fup_age` TEXT,
    `j_obesity_related_fup_days` TEXT,
    `j_osumm_cancer` TEXT,
    `j_osumm_cancer_fup_days` TEXT,
    `j_osumm_cancer_fup_age` TEXT,
    `j_osumm_cancer_dx_age` TEXT,
    `j_osumm_serous_grade_high` TEXT,
    `j_panc_cancer` TEXT,
    `j_panc_cancer_fup_days` TEXT,
    `j_panc_cancer_fup_age` TEXT,
    `j_panc_cancer_dx_age` TEXT,
    `j_phys_act_related_dx_age` TEXT,
    `j_phys_act_related` TEXT,
    `j_phys_act_related_fup_age` TEXT,
    `j_phys_act_related_fup_days` TEXT,
    `j_pros_cancer` TEXT,
    `j_pros_cancer_fup_days` TEXT,
    `j_pros_cancer_fup_age` TEXT,
    `j_pros_cancer_dx_age` TEXT,
    `j_pros_non_advanced` TEXT,
    `j_pros_advanced_including7` TEXT,
    `j_pros_advanced_excluding7` TEXT,
    `j_sarcoma` TEXT,
    `j_sarcoma_fup_days` TEXT,
    `j_sarcoma_fup_age` TEXT,
    `j_sarcoma_dx_age` TEXT,
    `j_smoking_related_dx_age` TEXT,
    `j_smoking_related` TEXT,
    `j_smoking_related_fup_age` TEXT,
    `j_smoking_related_fup_days` TEXT,
    `j_solid_tumor` TEXT,
    `j_solid_tumor_fup_days` TEXT,
    `j_solid_tumor_fup_age` TEXT,
    `j_solid_tumor_dx_age` TEXT,
    `j_squamous` TEXT,
    `j_squamous_fup_days` TEXT,
    `j_squamous_fup_age` TEXT,
    `j_squamous_dx_age` TEXT,
    `j_thyd_cancer` TEXT,
    `j_thyd_cancer_fup_days` TEXT,
    `j_thyd_cancer_fup_age` TEXT,
    `j_thyd_cancer_dx_age` TEXT,
    `j_upgi_cancer` TEXT,
    `j_upgi_cancer_fup_days` TEXT,
    `j_upgi_cancer_fup_age` TEXT,
    `j_upgi_cancer_dx_age` TEXT,
    `j_urothelial` TEXT,
    `j_urothelial_fup_days` TEXT,
    `j_urothelial_fup_age` TEXT,
    `j_urothelial_dx_age` TEXT,
    `is_dead` TEXT,
    `mortality_exitage` TEXT,
    `dth_days` TEXT,
    `mortality_exitdays_unadj` TEXT,
    `f_death_ischemic` TEXT,
    `f_death_cerebrovascular` TEXT,
    `f_death_rheumatic` TEXT,
    `f_death_hypertensive` TEXT,
    `f_death_peripheral` TEXT,
    `f_death_heart` TEXT,
    `f_death_cardiac` TEXT,
    `f_death_arrhythmia` TEXT,
    `f_death_endocarditis` TEXT,
    `f_death_cardiovascular` TEXT,
    `f_death_cancer` TEXT,
    `f_death_chronicresp` TEXT,
    `f_death_alzheimers` TEXT,
    `f_death_diabetes` TEXT,
    `f_death_nephritis` TEXT,
    `f_death_chronicliver` TEXT,
    `f_death_parkinsons` TEXT,
    `bq_educat_o` TEXT,
    `bq_marital_co` TEXT,
    `bq_fmenstr_o` TEXT,
    `bq_tubal_o` TEXT,
    `bq_bbd_b` TEXT,
    `bq_benign_ovcyst_b` TEXT,
    `bq_endometriosis_b` TEXT,
    `bq_uterine_fib_b` TEXT,
    `bq_trypreg_b` TEXT,
    `bq_urinatea_o` TEXT,
    `bq_infprosa_o` TEXT,
    `bq_hearta_f_b` TEXT,
    `bq_bronchit_f_b` TEXT,
    `bq_polyps_f_b` TEXT,
    `bq_ulcerative_colitits_b` TEXT,
    `bq_crohns_disease_b` TEXT,
    `bq_familial_polyposis_b` TEXT,
    `bq_hepatitis_b` TEXT,
    `bq_cirrhosis_b` TEXT,
    `bq_divertic_f_b` TEXT,
    `bq_gallblad_f_b` TEXT,
    `bq_age_co` TEXT,
    `bq_race7_ca` TEXT,
    `bq_hispanic_f_b` TEXT,
    `bq_surg_resection_b` TEXT,
    `bq_surg_prostatectomy_b` TEXT,
    `bq_hyster_f_b` TEXT,
    `bq_ovariesr_f_ca` TEXT,
    `bq_infpros_f_b` TEXT,
    `bq_urinate_f_o` TEXT,
    `bq_smoked_f_b` TEXT,
    `bq_smokea_f_co` TEXT,
    `bq_ssmokea_f_co` TEXT,
    `bq_cig_stop_co` TEXT,
    `bq_bmi_20_co` TEXT,
    `bq_bmi_50_co` TEXT,
    `bq_bmi_curr_co` TEXT,
    `bq_weight_f_co` TEXT,
    `bq_weight20_f_co` TEXT,
    `bq_weight50_f_co` TEXT,
    `bq_height_f_co` TEXT,
    `bq_fh_cancer_b` TEXT,
    `center` TEXT,
    `arm` TEXT,
    `sex` TEXT,
    `in_GSA_study` TEXT,
    `dqx_age_co` TEXT,
    `dqx_qxn_physicact_40_o` TEXT,
    `dqx_qxn_physicact_now_o` TEXT,
    `sqx_age_co` TEXT,
    `sqx_sit_ht_o` TEXT,
    `sqx_waist_hip_o` TEXT,
    `sqx_height_co` TEXT,
    `sqx_wt30s_co` TEXT,
    `sqx_wt40s_co` TEXT,
    `sqx_wt50s_co` TEXT,
    `sqx_wt60s_co` TEXT,
    `sqx_wt70s_co` TEXT,
    `sqx_wt_curr_co` TEXT,
    `sqx_bmi30s_co` TEXT,
    `sqx_bmi40s_co` TEXT,
    `sqx_bmi50s_co` TEXT,
    `sqx_bmi60s_co` TEXT,
    `sqx_bmi70s_co` TEXT,
    `sqx_bmi_curr_co` TEXT,
    `sqx_cholesterol_b` TEXT,
    `sqx_asthma_b` TEXT,
    `sqxbq_hearta_b` TEXT,
    `sqxbq_stroke_b` TEXT,
    `sqxbq_hyperten_b` TEXT,
    `sqxbq_diabetes_b` TEXT,
    `sqxbq_osteopor_b` TEXT,
    `sqxbq_emphysema_b` TEXT,
    `sqxbq_arthritis_b` TEXT,
    `sqx_broke_hip_b` TEXT,
    `sqx_broke_arm_b` TEXT,
    `sqx_broke_vertebra_b` TEXT,
    `sqx_broke_none_b` TEXT,
    `sqx_balding_trend_o` TEXT,
    `sqx_urinate_o` TEXT,
    `sqxbq_bpha_o` TEXT,
    `sqxbq_bph_b` TEXT,
    `sqx_lift_weights_b` TEXT,
    `sqx_lift_weights_lev_o` TEXT,
    `sqx_active_b` TEXT,
    `sqx_fh_blad_b` TEXT,
    `sqx_fh_breast_b` TEXT,
    `sqx_fh_colo_b` TEXT,
    `sqx_fh_endo_b` TEXT,
    `sqx_fh_leuk_b` TEXT,
    `sqx_fh_lung_b` TEXT,
    `sqx_fh_lymph_b` TEXT,
    `sqx_fh_ovar_b` TEXT,
    `sqx_fh_pros_b` TEXT,
    `sqx_fh_cancer_f_b` TEXT,
    `sqx_twins_b` TEXT,
    `sqx_smk100_b` TEXT,
    `sqx_amt_smk_o` TEXT,
    `sqx_smk_crave1_b` TEXT,
    `sqx_smk_crave2_b` TEXT,
    `sqx_smk_crave3_b` TEXT,
    `sqx_smk_crave4_b` TEXT,
    `sqx_smk_try_quit_b` TEXT,
    `sqx_smk_age_quit_co` TEXT,
    `sqx_worry_lungca_o` TEXT,
    `sqx_risk_lungca_o` TEXT,
    `sqx_smk_his_co` TEXT,
    `sqx_smk_behv_co` TEXT,
    `sqx_smk_ftnd_co` TEXT,
    `sqx_years_quit_co` TEXT,
    `sqx_cig_years_co` TEXT,
    `sqx_gain_chest_shoulders_b` TEXT,
    `sqx_gain_waist_stomach_b` TEXT,
    `sqx_gain_hips_thighs_b` TEXT,
    `sqx_gain_equally_over_b` TEXT,
    `sqx_lose_chest_shoulders_b` TEXT,
    `sqx_lose_waist_stomach_b` TEXT,
    `sqx_lose_hips_thighs_b` TEXT,
    `sqx_lose_equally_over_b` TEXT,
    `sqxbq_rheumatoid_arthritis_b` TEXT,
    `sqxbq_osteoarthritis_b` TEXT,
    `sqx_moderate_week_co` TEXT,
    `sqx_strenuous_week_co` TEXT,
    `sqx_ever_balding_b` TEXT,
    `sqx_top_bald_b` TEXT,
    `bq_menstr_natural_o` TEXT,
    `sqx_current_cigarette_b` TEXT,
    `sqxbq_relapse_b` TEXT,
    `bq_current_cigarette_b` TEXT,
    `bq_cig_stat_o` TEXT,
    `bq_cig_years_co` TEXT,
    `bq_cigar_o` TEXT,
    `bq_cigpd_f_o` TEXT,
    `bq_filtered_f_b` TEXT,
    `bq_pack_years_co` TEXT,
    `bq_pipe_o` TEXT,
    `sqx_pace_o` TEXT,
    `sqx_stairs_o` TEXT,
    `sqx_walk_mi_o` TEXT,
    `pack_years_bqelsesqx_co` TEXT,
    `sqx_smk_exp_adult_o` TEXT,
    `sqx_smk_lgt_ca` TEXT,
    `sqx_smk_menthol_b` TEXT,
    `sqx_smk_plan_quit_o` TEXT,
    `sqx_smk_wake_o` TEXT,
    `sqx_smk30days_b` TEXT,
    `sqxo_cig_stat_o` TEXT,
    `sqx_urinatea_o` TEXT,
    `SV_COFFEE_REG_NOSUG_DHQ` TEXT,
    `SV_COFFEE_DECAF_NOSUG_DHQ` TEXT,
    `MPED_FRUIT_NOJUICE_DHQ` TEXT,
    `DT_ALC_ALC_DRINKS_DHQ` TEXT,
    `DRINKER_DHQ` TEXT,
    `G_CANDY_CHOC_DHQ` TEXT,
    `G_RED5_DHQ` TEXT,
    `G_PROCESS_6_DHQ` TEXT,
    `G_FRUIT_DHQ` TEXT,
    `G_VEGETABLE_DHQ` TEXT,
    `G_FISH_TOTAL_DHQ` TEXT,
    `G_SALTY_GRAIN_SNACK_DHQ` TEXT,
    `G_FRUIT_CITRUS_DHQ` TEXT,
    `G_SODA_REG_DHQ` TEXT,
    `DT_KCAL_DHQ` TEXT,
    `DT_PROT_DHQ` TEXT,
    `DT_FAT_DHQ` TEXT,
    `DT_CARB_DHQ` TEXT,
    `DT_FIBER_CSFII_DHQ` TEXT,
    `DT_CAFFEINE_DHQ` TEXT,
    `GLY_LOAD_DHQ` TEXT,
    `MPED_GRAIN_DHQ` TEXT,
    `MPED_GRAIN_WHOLE_DHQ` TEXT,
    `MPED_VEG_DARK_GREEN_DHQ` TEXT,
    `MPED_DAIRY_DHQ` TEXT,
    `MPED_DAIRY_MILK_DHQ` TEXT,
    `MPED_M_SOY_DHQ` TEXT,
    `MPED_M_NUT_SEED_DHQ` TEXT,
    `MPED_LEGUME_DHQ` TEXT,
    `MPED_ADDED_SUGAR_DHQ` TEXT,
    `PE_FR_PROTEIN_DHQ` TEXT,
    `PE_FR_FAT_DHQ` TEXT,
    `PE_FR_CARB_DHQ` TEXT,
    `PE_FR_ALC_DHQ` TEXT,
    `GLY_INDEX_DHQ` TEXT,
    `DT_SUGAR_DHQ` TEXT,
    `AGE_DHQ` TEXT,
    `DHQ_COMPLETEDVALID` TEXT,
    `MPED_ALC_BEV_ALC_DRINKS18_DHQ` TEXT,
    `MPED_ALC_BEV_ALC_DRINKS25_DHQ` TEXT,
    `MPED_ALC_BEV_ALC_DRINKS40_DHQ` TEXT,
    `MPED_ALC_BEV_ALC_DRINKS55_DHQ` TEXT,
    `QXN_F_COFFEE_DHQ` TEXT,
    `WHFRDEN_DHQ` TEXT,
    `GRNDEN_DHQ` TEXT,
    `WGRNDEN_DHQ` TEXT,
    `DAIRYDEN_DHQ` TEXT,
    `HEI2005_TOTAL_SCORE_DHQ` TEXT,
    `HEI2010_TOTAL_SCORE_DHQ` TEXT,
    `ADDSUG_PERC2015_DHQ` TEXT,
    `HEI2015_TOTAL_SCORE_DHQ` TEXT,
    `SALTSNKDEN_G_DHQ` TEXT,
    `MILKDEN_DHQ` TEXT,
    `FRTDEN_G_DHQ` TEXT,
    `CITFRTDEN_G_DHQ` TEXT,
    `VEGTOTDEN_G_DHQ` TEXT,
    `DKGRVEGDEN_DHQ` TEXT,
    `LEGUMEDEN_DHQ` TEXT,
    `NUTDEN_DHQ` TEXT,
    `REDMTDEN_G_DHQ` TEXT,
    `PROCMTDEN_G_DHQ` TEXT,
    `FISHDEN_G_DHQ` TEXT,
    `SOYDEN_DHQ` TEXT,
    `current_drinker` TEXT,
    `former_drinker` TEXT,
    `drinker_status_dhq_o` TEXT,
    `ph_status` TEXT,
    `first_psa_level` TEXT,
    `first_psa_year` TEXT,
    `first_ca125_level` TEXT,
    `first_ca125_year` TEXT,
    `has_adenoma` TEXT,
    `has_advanced_adenoma` TEXT,
    `has_nonadvanced_adenoma` TEXT
) ENGINE=MYISAM;

-- load data into staging table
LOAD DATA LOCAL INFILE "raw/phenotype_data.tsv" INTO TABLE phenotype_data_stage
    FIELDS TERMINATED BY '\t'
    IGNORE 1 ROWS;

-- replace NA values with NULL
UPDATE phenotype_data_stage SET `j_adeno_carcinoma` = NULL WHERE j_adeno_carcinoma = 'NA';
UPDATE phenotype_data_stage SET `j_adeno_carcinoma_fup_days` = NULL WHERE j_adeno_carcinoma_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_adeno_carcinoma_fup_age` = NULL WHERE j_adeno_carcinoma_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_adeno_carcinoma_dx_age` = NULL WHERE j_adeno_carcinoma_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_alcohol_related_dx_age` = NULL WHERE j_alcohol_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_alcohol_related` = NULL WHERE j_alcohol_related = 'NA';
UPDATE phenotype_data_stage SET `j_alcohol_related_fup_age` = NULL WHERE j_alcohol_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_alcohol_related_fup_days` = NULL WHERE j_alcohol_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_bcell` = NULL WHERE j_bcell = 'NA';
UPDATE phenotype_data_stage SET `j_bcell_fup_days` = NULL WHERE j_bcell_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_bcell_fup_age` = NULL WHERE j_bcell_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_bcell_dx_age` = NULL WHERE j_bcell_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_bili_cancer` = NULL WHERE j_bili_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_bili_cancer_fup_days` = NULL WHERE j_bili_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_bili_cancer_fup_age` = NULL WHERE j_bili_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_bili_cancer_dx_age` = NULL WHERE j_bili_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_blad_cancer` = NULL WHERE j_blad_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_blad_cancer_fup_days` = NULL WHERE j_blad_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_blad_cancer_fup_age` = NULL WHERE j_blad_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_blad_cancer_dx_age` = NULL WHERE j_blad_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_breast_cancer` = NULL WHERE j_breast_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_breast_cancer_fup_days` = NULL WHERE j_breast_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_breast_cancer_fup_age` = NULL WHERE j_breast_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_breast_cancer_dx_age` = NULL WHERE j_breast_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_breast_invasive` = NULL WHERE j_breast_invasive = 'NA';
UPDATE phenotype_data_stage SET `j_breast_insitu` = NULL WHERE j_breast_insitu = 'NA';
UPDATE phenotype_data_stage SET `j_breast_ductal` = NULL WHERE j_breast_ductal = 'NA';
UPDATE phenotype_data_stage SET `j_breast_lobular` = NULL WHERE j_breast_lobular = 'NA';
UPDATE phenotype_data_stage SET `j_breast_tubular` = NULL WHERE j_breast_tubular = 'NA';
UPDATE phenotype_data_stage SET `j_breast_er_pos_or_equiv` = NULL WHERE j_breast_er_pos_or_equiv = 'NA';
UPDATE phenotype_data_stage SET `j_breast_er_neg` = NULL WHERE j_breast_er_neg = 'NA';
UPDATE phenotype_data_stage SET `j_breast_pr_pos_or_equiv` = NULL WHERE j_breast_pr_pos_or_equiv = 'NA';
UPDATE phenotype_data_stage SET `j_breast_pr_neg` = NULL WHERE j_breast_pr_neg = 'NA';
UPDATE phenotype_data_stage SET `j_breast_er_or_pr_pos` = NULL WHERE j_breast_er_or_pr_pos = 'NA';
UPDATE phenotype_data_stage SET `j_breast_er_and_pr_neg` = NULL WHERE j_breast_er_and_pr_neg = 'NA';
UPDATE phenotype_data_stage SET `j_breast_her2_pos_or_equiv` = NULL WHERE j_breast_her2_pos_or_equiv = 'NA';
UPDATE phenotype_data_stage SET `j_breast_her2_neg` = NULL WHERE j_breast_her2_neg = 'NA';
UPDATE phenotype_data_stage SET `j_breast_er_pr_and_her2_neg` = NULL WHERE j_breast_er_pr_and_her2_neg = 'NA';
UPDATE phenotype_data_stage SET `j_breast_grade34` = NULL WHERE j_breast_grade34 = 'NA';
UPDATE phenotype_data_stage SET `j_breast_grade2` = NULL WHERE j_breast_grade2 = 'NA';
UPDATE phenotype_data_stage SET `j_breast_grade1` = NULL WHERE j_breast_grade1 = 'NA';
UPDATE phenotype_data_stage SET `j_carcinoma` = NULL WHERE j_carcinoma = 'NA';
UPDATE phenotype_data_stage SET `j_carcinoma_fup_days` = NULL WHERE j_carcinoma_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_carcinoma_fup_age` = NULL WHERE j_carcinoma_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_carcinoma_dx_age` = NULL WHERE j_carcinoma_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_colo_cancer` = NULL WHERE j_colo_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_colo_cancer_fup_days` = NULL WHERE j_colo_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_colo_cancer_fup_age` = NULL WHERE j_colo_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_colo_cancer_dx_age` = NULL WHERE j_colo_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_colo_distal` = NULL WHERE j_colo_distal = 'NA';
UPDATE phenotype_data_stage SET `j_colo_distal_proximal` = NULL WHERE j_colo_distal_proximal = 'NA';
UPDATE phenotype_data_stage SET `j_colo_proximal` = NULL WHERE j_colo_proximal = 'NA';
UPDATE phenotype_data_stage SET `j_colo_rectal` = NULL WHERE j_colo_rectal = 'NA';
UPDATE phenotype_data_stage SET `j_diabetes_related_dx_age` = NULL WHERE j_diabetes_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_diabetes_related` = NULL WHERE j_diabetes_related = 'NA';
UPDATE phenotype_data_stage SET `j_diabetes_related_fup_age` = NULL WHERE j_diabetes_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_diabetes_related_fup_days` = NULL WHERE j_diabetes_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_ebv_related_dx_age` = NULL WHERE j_ebv_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_ebv_related` = NULL WHERE j_ebv_related = 'NA';
UPDATE phenotype_data_stage SET `j_ebv_related_fup_age` = NULL WHERE j_ebv_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_ebv_related_fup_days` = NULL WHERE j_ebv_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_endo_cancer` = NULL WHERE j_endo_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_endo_cancer_fup_days` = NULL WHERE j_endo_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_endo_cancer_fup_age` = NULL WHERE j_endo_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_endo_cancer_dx_age` = NULL WHERE j_endo_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_endo_neuro` = NULL WHERE j_endo_neuro = 'NA';
UPDATE phenotype_data_stage SET `j_endo_neuro_fup_days` = NULL WHERE j_endo_neuro_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_endo_neuro_fup_age` = NULL WHERE j_endo_neuro_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_endo_neuro_dx_age` = NULL WHERE j_endo_neuro_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_esoph_cancer` = NULL WHERE j_esoph_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_esoph_cancer_fup_days` = NULL WHERE j_esoph_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_esoph_cancer_fup_age` = NULL WHERE j_esoph_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_esoph_cancer_dx_age` = NULL WHERE j_esoph_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_esoph_squamous` = NULL WHERE j_esoph_squamous = 'NA';
UPDATE phenotype_data_stage SET `j_hbv_related_dx_age` = NULL WHERE j_hbv_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_hbv_related` = NULL WHERE j_hbv_related = 'NA';
UPDATE phenotype_data_stage SET `j_hbv_related_fup_age` = NULL WHERE j_hbv_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_hbv_related_fup_days` = NULL WHERE j_hbv_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_hcv_related_dx_age` = NULL WHERE j_hcv_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_hcv_related` = NULL WHERE j_hcv_related = 'NA';
UPDATE phenotype_data_stage SET `j_hcv_related_fup_age` = NULL WHERE j_hcv_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_hcv_related_fup_days` = NULL WHERE j_hcv_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_height_related_dx_age` = NULL WHERE j_height_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_height_related` = NULL WHERE j_height_related = 'NA';
UPDATE phenotype_data_stage SET `j_height_related_fup_age` = NULL WHERE j_height_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_height_related_fup_days` = NULL WHERE j_height_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_helicobacter_related_dx_age` = NULL WHERE j_helicobacter_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_helicobacter_related` = NULL WHERE j_helicobacter_related = 'NA';
UPDATE phenotype_data_stage SET `j_helicobacter_related_fup_age` = NULL WHERE j_helicobacter_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_helicobacter_related_fup_days` = NULL WHERE j_helicobacter_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_hematologic` = NULL WHERE j_hematologic = 'NA';
UPDATE phenotype_data_stage SET `j_hematologic_fup_days` = NULL WHERE j_hematologic_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_hematologic_fup_age` = NULL WHERE j_hematologic_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_hematologic_dx_age` = NULL WHERE j_hematologic_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_hnc_cancer` = NULL WHERE j_hnc_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_hnc_cancer_fup_days` = NULL WHERE j_hnc_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_hnc_cancer_fup_age` = NULL WHERE j_hnc_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_hnc_cancer_dx_age` = NULL WHERE j_hnc_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_hnc_larynx` = NULL WHERE j_hnc_larynx = 'NA';
UPDATE phenotype_data_stage SET `j_hnc_lip_oral_pharynx` = NULL WHERE j_hnc_lip_oral_pharynx = 'NA';
UPDATE phenotype_data_stage SET `j_hnc_naso_mid_sinus` = NULL WHERE j_hnc_naso_mid_sinus = 'NA';
UPDATE phenotype_data_stage SET `j_hpv_related_dx_age` = NULL WHERE j_hpv_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_hpv_related` = NULL WHERE j_hpv_related = 'NA';
UPDATE phenotype_data_stage SET `j_hpv_related_fup_age` = NULL WHERE j_hpv_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_hpv_related_fup_days` = NULL WHERE j_hpv_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_infection_related_dx_age` = NULL WHERE j_infection_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_infection_related` = NULL WHERE j_infection_related = 'NA';
UPDATE phenotype_data_stage SET `j_infection_related_fup_age` = NULL WHERE j_infection_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_infection_related_fup_days` = NULL WHERE j_infection_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_kidney_cancer_fup_days` = NULL WHERE j_kidney_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_kidney_cancer_fup_age` = NULL WHERE j_kidney_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_kidney_cancer_dx_age` = NULL WHERE j_kidney_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_kidney_cancer` = NULL WHERE j_kidney_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_kidney_renalcell_clearcell` = NULL WHERE j_kidney_renalcell_clearcell = 'NA';
UPDATE phenotype_data_stage SET `j_kidney_renalcell_nos` = NULL WHERE j_kidney_renalcell_nos = 'NA';
UPDATE phenotype_data_stage SET `j_gast_cancer` = NULL WHERE j_gast_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_gast_cancer_fup_days` = NULL WHERE j_gast_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_gast_cancer_fup_age` = NULL WHERE j_gast_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_gast_cancer_dx_age` = NULL WHERE j_gast_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_gast_cardia` = NULL WHERE j_gast_cardia = 'NA';
UPDATE phenotype_data_stage SET `j_gast_noncardia` = NULL WHERE j_gast_noncardia = 'NA';
UPDATE phenotype_data_stage SET `j_glio_cancer` = NULL WHERE j_glio_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_glio_cancer_fup_days` = NULL WHERE j_glio_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_glio_cancer_fup_age` = NULL WHERE j_glio_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_glio_cancer_dx_age` = NULL WHERE j_glio_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_liver_xintra_cancer_fup_days` = NULL WHERE j_liver_xintra_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_liver_xintra_cancer_fup_age` = NULL WHERE j_liver_xintra_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_liver_xintra_cancer_dx_age` = NULL WHERE j_liver_xintra_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_liver_xintra_cancer` = NULL WHERE j_liver_xintra_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_lung_cancer` = NULL WHERE j_lung_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_lung_cancer_fup_days` = NULL WHERE j_lung_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_lung_cancer_fup_age` = NULL WHERE j_lung_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_lung_cancer_dx_age` = NULL WHERE j_lung_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_lung_smallcell` = NULL WHERE j_lung_smallcell = 'NA';
UPDATE phenotype_data_stage SET `j_lung_adeno` = NULL WHERE j_lung_adeno = 'NA';
UPDATE phenotype_data_stage SET `j_lung_squam` = NULL WHERE j_lung_squam = 'NA';
UPDATE phenotype_data_stage SET `j_lymphoid` = NULL WHERE j_lymphoid = 'NA';
UPDATE phenotype_data_stage SET `j_lymphoid_fup_days` = NULL WHERE j_lymphoid_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_lymphoid_fup_age` = NULL WHERE j_lymphoid_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_lymphoid_dx_age` = NULL WHERE j_lymphoid_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_cll` = NULL WHERE j_cll = 'NA';
UPDATE phenotype_data_stage SET `j_cll_fup_days` = NULL WHERE j_cll_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_cll_fup_age` = NULL WHERE j_cll_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_cll_dx_age` = NULL WHERE j_cll_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_mbreast_cancer` = NULL WHERE j_mbreast_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_mbreast_cancer_fup_days` = NULL WHERE j_mbreast_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_mbreast_cancer_fup_age` = NULL WHERE j_mbreast_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_mbreast_cancer_dx_age` = NULL WHERE j_mbreast_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_mela_cancer` = NULL WHERE j_mela_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_mela_cancer_fup_days` = NULL WHERE j_mela_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_mela_cancer_fup_age` = NULL WHERE j_mela_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_mela_cancer_dx_age` = NULL WHERE j_mela_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_mesoth` = NULL WHERE j_mesoth = 'NA';
UPDATE phenotype_data_stage SET `j_mesoth_fup_days` = NULL WHERE j_mesoth_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_mesoth_fup_age` = NULL WHERE j_mesoth_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_mesoth_dx_age` = NULL WHERE j_mesoth_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_myeloid` = NULL WHERE j_myeloid = 'NA';
UPDATE phenotype_data_stage SET `j_myeloid_fup_days` = NULL WHERE j_myeloid_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_myeloid_fup_age` = NULL WHERE j_myeloid_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_myeloid_dx_age` = NULL WHERE j_myeloid_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_obesity_related_dx_age` = NULL WHERE j_obesity_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_obesity_related` = NULL WHERE j_obesity_related = 'NA';
UPDATE phenotype_data_stage SET `j_obesity_related_fup_age` = NULL WHERE j_obesity_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_obesity_related_fup_days` = NULL WHERE j_obesity_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_osumm_cancer` = NULL WHERE j_osumm_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_osumm_cancer_fup_days` = NULL WHERE j_osumm_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_osumm_cancer_fup_age` = NULL WHERE j_osumm_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_osumm_cancer_dx_age` = NULL WHERE j_osumm_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_osumm_serous_grade_high` = NULL WHERE j_osumm_serous_grade_high = 'NA';
UPDATE phenotype_data_stage SET `j_panc_cancer` = NULL WHERE j_panc_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_panc_cancer_fup_days` = NULL WHERE j_panc_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_panc_cancer_fup_age` = NULL WHERE j_panc_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_panc_cancer_dx_age` = NULL WHERE j_panc_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_phys_act_related_dx_age` = NULL WHERE j_phys_act_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_phys_act_related` = NULL WHERE j_phys_act_related = 'NA';
UPDATE phenotype_data_stage SET `j_phys_act_related_fup_age` = NULL WHERE j_phys_act_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_phys_act_related_fup_days` = NULL WHERE j_phys_act_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_pros_cancer` = NULL WHERE j_pros_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_pros_cancer_fup_days` = NULL WHERE j_pros_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_pros_cancer_fup_age` = NULL WHERE j_pros_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_pros_cancer_dx_age` = NULL WHERE j_pros_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_pros_non_advanced` = NULL WHERE j_pros_non_advanced = 'NA';
UPDATE phenotype_data_stage SET `j_pros_advanced_including7` = NULL WHERE j_pros_advanced_including7 = 'NA';
UPDATE phenotype_data_stage SET `j_pros_advanced_excluding7` = NULL WHERE j_pros_advanced_excluding7 = 'NA';
UPDATE phenotype_data_stage SET `j_sarcoma` = NULL WHERE j_sarcoma = 'NA';
UPDATE phenotype_data_stage SET `j_sarcoma_fup_days` = NULL WHERE j_sarcoma_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_sarcoma_fup_age` = NULL WHERE j_sarcoma_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_sarcoma_dx_age` = NULL WHERE j_sarcoma_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_smoking_related_dx_age` = NULL WHERE j_smoking_related_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_smoking_related` = NULL WHERE j_smoking_related = 'NA';
UPDATE phenotype_data_stage SET `j_smoking_related_fup_age` = NULL WHERE j_smoking_related_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_smoking_related_fup_days` = NULL WHERE j_smoking_related_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_solid_tumor` = NULL WHERE j_solid_tumor = 'NA';
UPDATE phenotype_data_stage SET `j_solid_tumor_fup_days` = NULL WHERE j_solid_tumor_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_solid_tumor_fup_age` = NULL WHERE j_solid_tumor_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_solid_tumor_dx_age` = NULL WHERE j_solid_tumor_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_squamous` = NULL WHERE j_squamous = 'NA';
UPDATE phenotype_data_stage SET `j_squamous_fup_days` = NULL WHERE j_squamous_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_squamous_fup_age` = NULL WHERE j_squamous_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_squamous_dx_age` = NULL WHERE j_squamous_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_thyd_cancer` = NULL WHERE j_thyd_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_thyd_cancer_fup_days` = NULL WHERE j_thyd_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_thyd_cancer_fup_age` = NULL WHERE j_thyd_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_thyd_cancer_dx_age` = NULL WHERE j_thyd_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_upgi_cancer` = NULL WHERE j_upgi_cancer = 'NA';
UPDATE phenotype_data_stage SET `j_upgi_cancer_fup_days` = NULL WHERE j_upgi_cancer_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_upgi_cancer_fup_age` = NULL WHERE j_upgi_cancer_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_upgi_cancer_dx_age` = NULL WHERE j_upgi_cancer_dx_age = 'NA';
UPDATE phenotype_data_stage SET `j_urothelial` = NULL WHERE j_urothelial = 'NA';
UPDATE phenotype_data_stage SET `j_urothelial_fup_days` = NULL WHERE j_urothelial_fup_days = 'NA';
UPDATE phenotype_data_stage SET `j_urothelial_fup_age` = NULL WHERE j_urothelial_fup_age = 'NA';
UPDATE phenotype_data_stage SET `j_urothelial_dx_age` = NULL WHERE j_urothelial_dx_age = 'NA';
UPDATE phenotype_data_stage SET `is_dead` = NULL WHERE is_dead = 'NA';
UPDATE phenotype_data_stage SET `mortality_exitage` = NULL WHERE mortality_exitage = 'NA';
UPDATE phenotype_data_stage SET `dth_days` = NULL WHERE dth_days = 'NA';
UPDATE phenotype_data_stage SET `mortality_exitdays_unadj` = NULL WHERE mortality_exitdays_unadj = 'NA';
UPDATE phenotype_data_stage SET `f_death_ischemic` = NULL WHERE f_death_ischemic = 'NA';
UPDATE phenotype_data_stage SET `f_death_cerebrovascular` = NULL WHERE f_death_cerebrovascular = 'NA';
UPDATE phenotype_data_stage SET `f_death_rheumatic` = NULL WHERE f_death_rheumatic = 'NA';
UPDATE phenotype_data_stage SET `f_death_hypertensive` = NULL WHERE f_death_hypertensive = 'NA';
UPDATE phenotype_data_stage SET `f_death_peripheral` = NULL WHERE f_death_peripheral = 'NA';
UPDATE phenotype_data_stage SET `f_death_heart` = NULL WHERE f_death_heart = 'NA';
UPDATE phenotype_data_stage SET `f_death_cardiac` = NULL WHERE f_death_cardiac = 'NA';
UPDATE phenotype_data_stage SET `f_death_arrhythmia` = NULL WHERE f_death_arrhythmia = 'NA';
UPDATE phenotype_data_stage SET `f_death_endocarditis` = NULL WHERE f_death_endocarditis = 'NA';
UPDATE phenotype_data_stage SET `f_death_cardiovascular` = NULL WHERE f_death_cardiovascular = 'NA';
UPDATE phenotype_data_stage SET `f_death_cancer` = NULL WHERE f_death_cancer = 'NA';
UPDATE phenotype_data_stage SET `f_death_chronicresp` = NULL WHERE f_death_chronicresp = 'NA';
UPDATE phenotype_data_stage SET `f_death_alzheimers` = NULL WHERE f_death_alzheimers = 'NA';
UPDATE phenotype_data_stage SET `f_death_diabetes` = NULL WHERE f_death_diabetes = 'NA';
UPDATE phenotype_data_stage SET `f_death_nephritis` = NULL WHERE f_death_nephritis = 'NA';
UPDATE phenotype_data_stage SET `f_death_chronicliver` = NULL WHERE f_death_chronicliver = 'NA';
UPDATE phenotype_data_stage SET `f_death_parkinsons` = NULL WHERE f_death_parkinsons = 'NA';
UPDATE phenotype_data_stage SET `bq_educat_o` = NULL WHERE bq_educat_o = 'NA';
UPDATE phenotype_data_stage SET `bq_marital_co` = NULL WHERE bq_marital_co = 'NA';
UPDATE phenotype_data_stage SET `bq_fmenstr_o` = NULL WHERE bq_fmenstr_o = 'NA';
UPDATE phenotype_data_stage SET `bq_tubal_o` = NULL WHERE bq_tubal_o = 'NA';
UPDATE phenotype_data_stage SET `bq_bbd_b` = NULL WHERE bq_bbd_b = 'NA';
UPDATE phenotype_data_stage SET `bq_benign_ovcyst_b` = NULL WHERE bq_benign_ovcyst_b = 'NA';
UPDATE phenotype_data_stage SET `bq_endometriosis_b` = NULL WHERE bq_endometriosis_b = 'NA';
UPDATE phenotype_data_stage SET `bq_uterine_fib_b` = NULL WHERE bq_uterine_fib_b = 'NA';
UPDATE phenotype_data_stage SET `bq_trypreg_b` = NULL WHERE bq_trypreg_b = 'NA';
UPDATE phenotype_data_stage SET `bq_urinatea_o` = NULL WHERE bq_urinatea_o = 'NA';
UPDATE phenotype_data_stage SET `bq_infprosa_o` = NULL WHERE bq_infprosa_o = 'NA';
UPDATE phenotype_data_stage SET `bq_hearta_f_b` = NULL WHERE bq_hearta_f_b = 'NA';
UPDATE phenotype_data_stage SET `bq_bronchit_f_b` = NULL WHERE bq_bronchit_f_b = 'NA';
UPDATE phenotype_data_stage SET `bq_polyps_f_b` = NULL WHERE bq_polyps_f_b = 'NA';
UPDATE phenotype_data_stage SET `bq_ulcerative_colitits_b` = NULL WHERE bq_ulcerative_colitits_b = 'NA';
UPDATE phenotype_data_stage SET `bq_crohns_disease_b` = NULL WHERE bq_crohns_disease_b = 'NA';
UPDATE phenotype_data_stage SET `bq_familial_polyposis_b` = NULL WHERE bq_familial_polyposis_b = 'NA';
UPDATE phenotype_data_stage SET `bq_hepatitis_b` = NULL WHERE bq_hepatitis_b = 'NA';
UPDATE phenotype_data_stage SET `bq_cirrhosis_b` = NULL WHERE bq_cirrhosis_b = 'NA';
UPDATE phenotype_data_stage SET `bq_divertic_f_b` = NULL WHERE bq_divertic_f_b = 'NA';
UPDATE phenotype_data_stage SET `bq_gallblad_f_b` = NULL WHERE bq_gallblad_f_b = 'NA';
UPDATE phenotype_data_stage SET `bq_age_co` = NULL WHERE bq_age_co = 'NA';
UPDATE phenotype_data_stage SET `bq_race7_ca` = NULL WHERE bq_race7_ca = 'NA';
UPDATE phenotype_data_stage SET `bq_hispanic_f_b` = NULL WHERE bq_hispanic_f_b = 'NA';
UPDATE phenotype_data_stage SET `bq_surg_resection_b` = NULL WHERE bq_surg_resection_b = 'NA';
UPDATE phenotype_data_stage SET `bq_surg_prostatectomy_b` = NULL WHERE bq_surg_prostatectomy_b = 'NA';
UPDATE phenotype_data_stage SET `bq_hyster_f_b` = NULL WHERE bq_hyster_f_b = 'NA';
UPDATE phenotype_data_stage SET `bq_ovariesr_f_ca` = NULL WHERE bq_ovariesr_f_ca = 'NA';
UPDATE phenotype_data_stage SET `bq_infpros_f_b` = NULL WHERE bq_infpros_f_b = 'NA';
UPDATE phenotype_data_stage SET `bq_urinate_f_o` = NULL WHERE bq_urinate_f_o = 'NA';
UPDATE phenotype_data_stage SET `bq_smoked_f_b` = NULL WHERE bq_smoked_f_b = 'NA';
UPDATE phenotype_data_stage SET `bq_smokea_f_co` = NULL WHERE bq_smokea_f_co = 'NA';
UPDATE phenotype_data_stage SET `bq_ssmokea_f_co` = NULL WHERE bq_ssmokea_f_co = 'NA';
UPDATE phenotype_data_stage SET `bq_cig_stop_co` = NULL WHERE bq_cig_stop_co = 'NA';
UPDATE phenotype_data_stage SET `bq_bmi_20_co` = NULL WHERE bq_bmi_20_co = 'NA';
UPDATE phenotype_data_stage SET `bq_bmi_50_co` = NULL WHERE bq_bmi_50_co = 'NA';
UPDATE phenotype_data_stage SET `bq_bmi_curr_co` = NULL WHERE bq_bmi_curr_co = 'NA';
UPDATE phenotype_data_stage SET `bq_weight_f_co` = NULL WHERE bq_weight_f_co = 'NA';
UPDATE phenotype_data_stage SET `bq_weight20_f_co` = NULL WHERE bq_weight20_f_co = 'NA';
UPDATE phenotype_data_stage SET `bq_weight50_f_co` = NULL WHERE bq_weight50_f_co = 'NA';
UPDATE phenotype_data_stage SET `bq_height_f_co` = NULL WHERE bq_height_f_co = 'NA';
UPDATE phenotype_data_stage SET `bq_fh_cancer_b` = NULL WHERE bq_fh_cancer_b = 'NA';
UPDATE phenotype_data_stage SET `center` = NULL WHERE center = 'NA';
UPDATE phenotype_data_stage SET `arm` = NULL WHERE arm = 'NA';
UPDATE phenotype_data_stage SET `sex` = NULL WHERE sex = 'NA';
UPDATE phenotype_data_stage SET `in_GSA_study` = NULL WHERE in_GSA_study = 'NA';
UPDATE phenotype_data_stage SET `dqx_age_co` = NULL WHERE dqx_age_co = 'NA';
UPDATE phenotype_data_stage SET `dqx_qxn_physicact_40_o` = NULL WHERE dqx_qxn_physicact_40_o = 'NA';
UPDATE phenotype_data_stage SET `dqx_qxn_physicact_now_o` = NULL WHERE dqx_qxn_physicact_now_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_age_co` = NULL WHERE sqx_age_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_sit_ht_o` = NULL WHERE sqx_sit_ht_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_waist_hip_o` = NULL WHERE sqx_waist_hip_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_height_co` = NULL WHERE sqx_height_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_wt30s_co` = NULL WHERE sqx_wt30s_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_wt40s_co` = NULL WHERE sqx_wt40s_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_wt50s_co` = NULL WHERE sqx_wt50s_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_wt60s_co` = NULL WHERE sqx_wt60s_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_wt70s_co` = NULL WHERE sqx_wt70s_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_wt_curr_co` = NULL WHERE sqx_wt_curr_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_bmi30s_co` = NULL WHERE sqx_bmi30s_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_bmi40s_co` = NULL WHERE sqx_bmi40s_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_bmi50s_co` = NULL WHERE sqx_bmi50s_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_bmi60s_co` = NULL WHERE sqx_bmi60s_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_bmi70s_co` = NULL WHERE sqx_bmi70s_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_bmi_curr_co` = NULL WHERE sqx_bmi_curr_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_cholesterol_b` = NULL WHERE sqx_cholesterol_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_asthma_b` = NULL WHERE sqx_asthma_b = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_hearta_b` = NULL WHERE sqxbq_hearta_b = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_stroke_b` = NULL WHERE sqxbq_stroke_b = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_hyperten_b` = NULL WHERE sqxbq_hyperten_b = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_diabetes_b` = NULL WHERE sqxbq_diabetes_b = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_osteopor_b` = NULL WHERE sqxbq_osteopor_b = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_emphysema_b` = NULL WHERE sqxbq_emphysema_b = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_arthritis_b` = NULL WHERE sqxbq_arthritis_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_broke_hip_b` = NULL WHERE sqx_broke_hip_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_broke_arm_b` = NULL WHERE sqx_broke_arm_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_broke_vertebra_b` = NULL WHERE sqx_broke_vertebra_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_broke_none_b` = NULL WHERE sqx_broke_none_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_balding_trend_o` = NULL WHERE sqx_balding_trend_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_urinate_o` = NULL WHERE sqx_urinate_o = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_bpha_o` = NULL WHERE sqxbq_bpha_o = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_bph_b` = NULL WHERE sqxbq_bph_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_lift_weights_b` = NULL WHERE sqx_lift_weights_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_lift_weights_lev_o` = NULL WHERE sqx_lift_weights_lev_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_active_b` = NULL WHERE sqx_active_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_fh_blad_b` = NULL WHERE sqx_fh_blad_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_fh_breast_b` = NULL WHERE sqx_fh_breast_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_fh_colo_b` = NULL WHERE sqx_fh_colo_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_fh_endo_b` = NULL WHERE sqx_fh_endo_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_fh_leuk_b` = NULL WHERE sqx_fh_leuk_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_fh_lung_b` = NULL WHERE sqx_fh_lung_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_fh_lymph_b` = NULL WHERE sqx_fh_lymph_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_fh_ovar_b` = NULL WHERE sqx_fh_ovar_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_fh_pros_b` = NULL WHERE sqx_fh_pros_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_fh_cancer_f_b` = NULL WHERE sqx_fh_cancer_f_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_twins_b` = NULL WHERE sqx_twins_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk100_b` = NULL WHERE sqx_smk100_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_amt_smk_o` = NULL WHERE sqx_amt_smk_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_crave1_b` = NULL WHERE sqx_smk_crave1_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_crave2_b` = NULL WHERE sqx_smk_crave2_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_crave3_b` = NULL WHERE sqx_smk_crave3_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_crave4_b` = NULL WHERE sqx_smk_crave4_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_try_quit_b` = NULL WHERE sqx_smk_try_quit_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_age_quit_co` = NULL WHERE sqx_smk_age_quit_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_worry_lungca_o` = NULL WHERE sqx_worry_lungca_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_risk_lungca_o` = NULL WHERE sqx_risk_lungca_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_his_co` = NULL WHERE sqx_smk_his_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_behv_co` = NULL WHERE sqx_smk_behv_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_ftnd_co` = NULL WHERE sqx_smk_ftnd_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_years_quit_co` = NULL WHERE sqx_years_quit_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_cig_years_co` = NULL WHERE sqx_cig_years_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_gain_chest_shoulders_b` = NULL WHERE sqx_gain_chest_shoulders_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_gain_waist_stomach_b` = NULL WHERE sqx_gain_waist_stomach_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_gain_hips_thighs_b` = NULL WHERE sqx_gain_hips_thighs_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_gain_equally_over_b` = NULL WHERE sqx_gain_equally_over_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_lose_chest_shoulders_b` = NULL WHERE sqx_lose_chest_shoulders_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_lose_waist_stomach_b` = NULL WHERE sqx_lose_waist_stomach_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_lose_hips_thighs_b` = NULL WHERE sqx_lose_hips_thighs_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_lose_equally_over_b` = NULL WHERE sqx_lose_equally_over_b = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_rheumatoid_arthritis_b` = NULL WHERE sqxbq_rheumatoid_arthritis_b = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_osteoarthritis_b` = NULL WHERE sqxbq_osteoarthritis_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_moderate_week_co` = NULL WHERE sqx_moderate_week_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_strenuous_week_co` = NULL WHERE sqx_strenuous_week_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_ever_balding_b` = NULL WHERE sqx_ever_balding_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_top_bald_b` = NULL WHERE sqx_top_bald_b = 'NA';
UPDATE phenotype_data_stage SET `bq_menstr_natural_o` = NULL WHERE bq_menstr_natural_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_current_cigarette_b` = NULL WHERE sqx_current_cigarette_b = 'NA';
UPDATE phenotype_data_stage SET `sqxbq_relapse_b` = NULL WHERE sqxbq_relapse_b = 'NA';
UPDATE phenotype_data_stage SET `bq_current_cigarette_b` = NULL WHERE bq_current_cigarette_b = 'NA';
UPDATE phenotype_data_stage SET `bq_cig_stat_o` = NULL WHERE bq_cig_stat_o = 'NA';
UPDATE phenotype_data_stage SET `bq_cig_years_co` = NULL WHERE bq_cig_years_co = 'NA';
UPDATE phenotype_data_stage SET `bq_cigar_o` = NULL WHERE bq_cigar_o = 'NA';
UPDATE phenotype_data_stage SET `bq_cigpd_f_o` = NULL WHERE bq_cigpd_f_o = 'NA';
UPDATE phenotype_data_stage SET `bq_filtered_f_b` = NULL WHERE bq_filtered_f_b = 'NA';
UPDATE phenotype_data_stage SET `bq_pack_years_co` = NULL WHERE bq_pack_years_co = 'NA';
UPDATE phenotype_data_stage SET `bq_pipe_o` = NULL WHERE bq_pipe_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_pace_o` = NULL WHERE sqx_pace_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_stairs_o` = NULL WHERE sqx_stairs_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_walk_mi_o` = NULL WHERE sqx_walk_mi_o = 'NA';
UPDATE phenotype_data_stage SET `pack_years_bqelsesqx_co` = NULL WHERE pack_years_bqelsesqx_co = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_exp_adult_o` = NULL WHERE sqx_smk_exp_adult_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_lgt_ca` = NULL WHERE sqx_smk_lgt_ca = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_menthol_b` = NULL WHERE sqx_smk_menthol_b = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_plan_quit_o` = NULL WHERE sqx_smk_plan_quit_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk_wake_o` = NULL WHERE sqx_smk_wake_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_smk30days_b` = NULL WHERE sqx_smk30days_b = 'NA';
UPDATE phenotype_data_stage SET `sqxo_cig_stat_o` = NULL WHERE sqxo_cig_stat_o = 'NA';
UPDATE phenotype_data_stage SET `sqx_urinatea_o` = NULL WHERE sqx_urinatea_o = 'NA';
UPDATE phenotype_data_stage SET `SV_COFFEE_REG_NOSUG_DHQ` = NULL WHERE SV_COFFEE_REG_NOSUG_DHQ = 'NA';
UPDATE phenotype_data_stage SET `SV_COFFEE_DECAF_NOSUG_DHQ` = NULL WHERE SV_COFFEE_DECAF_NOSUG_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_FRUIT_NOJUICE_DHQ` = NULL WHERE MPED_FRUIT_NOJUICE_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DT_ALC_ALC_DRINKS_DHQ` = NULL WHERE DT_ALC_ALC_DRINKS_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DRINKER_DHQ` = NULL WHERE DRINKER_DHQ = 'NA';
UPDATE phenotype_data_stage SET `G_CANDY_CHOC_DHQ` = NULL WHERE G_CANDY_CHOC_DHQ = 'NA';
UPDATE phenotype_data_stage SET `G_RED5_DHQ` = NULL WHERE G_RED5_DHQ = 'NA';
UPDATE phenotype_data_stage SET `G_PROCESS_6_DHQ` = NULL WHERE G_PROCESS_6_DHQ = 'NA';
UPDATE phenotype_data_stage SET `G_FRUIT_DHQ` = NULL WHERE G_FRUIT_DHQ = 'NA';
UPDATE phenotype_data_stage SET `G_VEGETABLE_DHQ` = NULL WHERE G_VEGETABLE_DHQ = 'NA';
UPDATE phenotype_data_stage SET `G_FISH_TOTAL_DHQ` = NULL WHERE G_FISH_TOTAL_DHQ = 'NA';
UPDATE phenotype_data_stage SET `G_SALTY_GRAIN_SNACK_DHQ` = NULL WHERE G_SALTY_GRAIN_SNACK_DHQ = 'NA';
UPDATE phenotype_data_stage SET `G_FRUIT_CITRUS_DHQ` = NULL WHERE G_FRUIT_CITRUS_DHQ = 'NA';
UPDATE phenotype_data_stage SET `G_SODA_REG_DHQ` = NULL WHERE G_SODA_REG_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DT_KCAL_DHQ` = NULL WHERE DT_KCAL_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DT_PROT_DHQ` = NULL WHERE DT_PROT_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DT_FAT_DHQ` = NULL WHERE DT_FAT_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DT_CARB_DHQ` = NULL WHERE DT_CARB_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DT_FIBER_CSFII_DHQ` = NULL WHERE DT_FIBER_CSFII_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DT_CAFFEINE_DHQ` = NULL WHERE DT_CAFFEINE_DHQ = 'NA';
UPDATE phenotype_data_stage SET `GLY_LOAD_DHQ` = NULL WHERE GLY_LOAD_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_GRAIN_DHQ` = NULL WHERE MPED_GRAIN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_GRAIN_WHOLE_DHQ` = NULL WHERE MPED_GRAIN_WHOLE_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_VEG_DARK_GREEN_DHQ` = NULL WHERE MPED_VEG_DARK_GREEN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_DAIRY_DHQ` = NULL WHERE MPED_DAIRY_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_DAIRY_MILK_DHQ` = NULL WHERE MPED_DAIRY_MILK_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_M_SOY_DHQ` = NULL WHERE MPED_M_SOY_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_M_NUT_SEED_DHQ` = NULL WHERE MPED_M_NUT_SEED_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_LEGUME_DHQ` = NULL WHERE MPED_LEGUME_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_ADDED_SUGAR_DHQ` = NULL WHERE MPED_ADDED_SUGAR_DHQ = 'NA';
UPDATE phenotype_data_stage SET `PE_FR_PROTEIN_DHQ` = NULL WHERE PE_FR_PROTEIN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `PE_FR_FAT_DHQ` = NULL WHERE PE_FR_FAT_DHQ = 'NA';
UPDATE phenotype_data_stage SET `PE_FR_CARB_DHQ` = NULL WHERE PE_FR_CARB_DHQ = 'NA';
UPDATE phenotype_data_stage SET `PE_FR_ALC_DHQ` = NULL WHERE PE_FR_ALC_DHQ = 'NA';
UPDATE phenotype_data_stage SET `GLY_INDEX_DHQ` = NULL WHERE GLY_INDEX_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DT_SUGAR_DHQ` = NULL WHERE DT_SUGAR_DHQ = 'NA';
UPDATE phenotype_data_stage SET `AGE_DHQ` = NULL WHERE AGE_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DHQ_COMPLETEDVALID` = NULL WHERE DHQ_COMPLETEDVALID = 'NA';
UPDATE phenotype_data_stage SET `MPED_ALC_BEV_ALC_DRINKS18_DHQ` = NULL WHERE MPED_ALC_BEV_ALC_DRINKS18_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_ALC_BEV_ALC_DRINKS25_DHQ` = NULL WHERE MPED_ALC_BEV_ALC_DRINKS25_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_ALC_BEV_ALC_DRINKS40_DHQ` = NULL WHERE MPED_ALC_BEV_ALC_DRINKS40_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MPED_ALC_BEV_ALC_DRINKS55_DHQ` = NULL WHERE MPED_ALC_BEV_ALC_DRINKS55_DHQ = 'NA';
UPDATE phenotype_data_stage SET `QXN_F_COFFEE_DHQ` = NULL WHERE QXN_F_COFFEE_DHQ = 'NA';
UPDATE phenotype_data_stage SET `WHFRDEN_DHQ` = NULL WHERE WHFRDEN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `GRNDEN_DHQ` = NULL WHERE GRNDEN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `WGRNDEN_DHQ` = NULL WHERE WGRNDEN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DAIRYDEN_DHQ` = NULL WHERE DAIRYDEN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `HEI2005_TOTAL_SCORE_DHQ` = NULL WHERE HEI2005_TOTAL_SCORE_DHQ = 'NA';
UPDATE phenotype_data_stage SET `HEI2010_TOTAL_SCORE_DHQ` = NULL WHERE HEI2010_TOTAL_SCORE_DHQ = 'NA';
UPDATE phenotype_data_stage SET `ADDSUG_PERC2015_DHQ` = NULL WHERE ADDSUG_PERC2015_DHQ = 'NA';
UPDATE phenotype_data_stage SET `HEI2015_TOTAL_SCORE_DHQ` = NULL WHERE HEI2015_TOTAL_SCORE_DHQ = 'NA';
UPDATE phenotype_data_stage SET `SALTSNKDEN_G_DHQ` = NULL WHERE SALTSNKDEN_G_DHQ = 'NA';
UPDATE phenotype_data_stage SET `MILKDEN_DHQ` = NULL WHERE MILKDEN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `FRTDEN_G_DHQ` = NULL WHERE FRTDEN_G_DHQ = 'NA';
UPDATE phenotype_data_stage SET `CITFRTDEN_G_DHQ` = NULL WHERE CITFRTDEN_G_DHQ = 'NA';
UPDATE phenotype_data_stage SET `VEGTOTDEN_G_DHQ` = NULL WHERE VEGTOTDEN_G_DHQ = 'NA';
UPDATE phenotype_data_stage SET `DKGRVEGDEN_DHQ` = NULL WHERE DKGRVEGDEN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `LEGUMEDEN_DHQ` = NULL WHERE LEGUMEDEN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `NUTDEN_DHQ` = NULL WHERE NUTDEN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `REDMTDEN_G_DHQ` = NULL WHERE REDMTDEN_G_DHQ = 'NA';
UPDATE phenotype_data_stage SET `PROCMTDEN_G_DHQ` = NULL WHERE PROCMTDEN_G_DHQ = 'NA';
UPDATE phenotype_data_stage SET `FISHDEN_G_DHQ` = NULL WHERE FISHDEN_G_DHQ = 'NA';
UPDATE phenotype_data_stage SET `SOYDEN_DHQ` = NULL WHERE SOYDEN_DHQ = 'NA';
UPDATE phenotype_data_stage SET `current_drinker` = NULL WHERE current_drinker = 'NA';
UPDATE phenotype_data_stage SET `former_drinker` = NULL WHERE former_drinker = 'NA';
UPDATE phenotype_data_stage SET `drinker_status_dhq_o` = NULL WHERE drinker_status_dhq_o = 'NA';
UPDATE phenotype_data_stage SET `ph_status` = NULL WHERE ph_status = 'NA';
UPDATE phenotype_data_stage SET `first_psa_level` = NULL WHERE first_psa_level = 'NA';
UPDATE phenotype_data_stage SET `first_psa_year` = NULL WHERE first_psa_year = 'NA';
UPDATE phenotype_data_stage SET `first_ca125_level` = NULL WHERE first_ca125_level = 'NA';
UPDATE phenotype_data_stage SET `first_ca125_year` = NULL WHERE first_ca125_year = 'NA';
UPDATE phenotype_data_stage SET `has_adenoma` = NULL WHERE has_adenoma = 'NA';
UPDATE phenotype_data_stage SET `has_advanced_adenoma` = NULL WHERE has_advanced_adenoma = 'NA';
UPDATE phenotype_data_stage SET `has_nonadvanced_adenoma` = NULL WHERE has_nonadvanced_adenoma = 'NA';

COMMIT;