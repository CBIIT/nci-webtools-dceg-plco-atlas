setwd("~/Desktop/dev/nci-webtools-dceg-plco-atlas/server/scripts")
library(tidyverse)

phenotype <- "meta_fixed_assoc"

source("qqplot-query-db.R")
query(phenotype)
 
