# remove databases
# rm ../data/meta_fixed_assoc.db
# rm ../data/mel.db
# rm ../data/rcc.db

# shuffles databases when importing

# import into ewing's sarcoma, rcc(female), mel(male)
# node import.js ../data/meta_fixed_assoc.meta ../data/meta_fixed_assoc.db ewing all
# node import.js ../data/rcc.txt ../data/meta_fixed_assoc.db rcc female
# node import.js ../data/mel.txt ../data/meta_fixed_assoc.db mel male

# # import into melanoma, rcc(female), ewing(male)
# node import.js ../data/mel.txt ../data/mel.db mel all
# node import.js ../data/rcc.txt ../data/mel.db rcc female
# node import.js ../data/meta_fixed_assoc.meta ../data/mel.db ewing male

# # import renal cell carcinoma, ewing(female), mel(male)
node import.js ../data/rcc.txt ../data/rcc.db rcc all
node import.js ../data/meta_fixed_assoc.meta ../data/rcc.db ewing female
node import.js ../data/mel.txt ../data/rcc.db mel male