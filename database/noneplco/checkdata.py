import pandas as pd
import gzip
from datetime import date
from datetime import datetime
import numpy as np

#map for europen all
input_file_folder = ''
input_file_map = "inputfileSinglemap.csv"
data_files = pd.read_csv(input_file_map)


for index, row in data_files.iterrows():
    filename = row['filename']
    dpath = row['path']
    dataset = row['study_id']
    ancestry = row["ancestry"]
    sex = row["sex"]
    hasN = row["n"]
    hasFreq = row["hasFreq"]
    hasOdds = row["has_odds_ratio"]
    output_file = "./data/"+filename+".tsv"
    time0 = datetime.now()
    print(time0,'reading file:',dpath,"output file:",output_file)
    mapcolumn = {}
    fileExtention = ancestry.title()+"_"+sex
 
    mapcolumn = { "chromosome":"CHR",
                  "base_pair_location":"POS",
                  "variant_id":"SNP",   
                  "effect_allele":"Tested_Allele",      
                  "other_allele":"Other_Allele"
                }

    if hasFreq == "yes":
        mapcolumn["effect_allele_frequency"]="FREQ_"+ancestry.title() 
   
    mapcolumn["beta"]="BETA_"+fileExtention
    mapcolumn["standard_error"]="SE_"+fileExtention
    mapcolumn["p_value"]="P_"+fileExtention
    #mapcolumn["n"] = "N_"+fileExtention
    if hasOdds == "yes":
        mapcolumn["odds_ratio"] = "ODDS_"+fileExtention 
   
    data = pd.read_csv(input_file_folder+dpath,sep='\t')
    data.rename(columns=mapcolumn,inplace=True)
    selected_columns =list(mapcolumn.values())
    selected_data = data[selected_columns]
    df = pd.DataFrame(selected_data)

    # put the freq in right order
    if hasFreq == "none":
        #selected_data["FREQ_"+fileExtention]= np.nan
        df.insert(5,"FREQ_"+ancestry.title(),np.nan )

    if hasOdds == "none":
       selected_data["ODDS_"+fileExtention]= np.nan
    
    selected_data["N_"+fileExtention] = hasN
    selected_data["PHet_"+fileExtention]= np.nan
    sorted = df.sort_values(by="BETA_"+fileExtention, ascending=False)
    #maxValues = df.max()
    #print(maxValues)
   
    sorted.to_csv(output_file,sep='\t',index=False, na_rep='NA')

    #output_file_gz = output_file+".gz"
    #with open(output_file,'rb') as tsv_file:
    #    with gzip.open(output_file_gz,'wb') as gzipped_file:
    #        gzipped_file.writelines(tsv_file)
    print(datetime.now(), "output file, takes time:", datetime.now()-time0)




