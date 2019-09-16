setwd("~/Desktop/dev/nci-webtools-dceg-plco-atlas/server/scripts")
library(tidyverse)

phenotype <- "rcc"

source("qqplot-query-db.R")
query(phenotype)
 
