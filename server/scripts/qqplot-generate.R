setwd("~/Desktop/dev/nci-webtools-dceg-plco-atlas/server/scripts")
# library(imagemap)
library(tidyverse)
source("qqplot-imagemap-builder.R")

phenotype <- "mel"

im <- imagemap(phenotype,height=800,width=800)
source("qqplot-query-db.R")
query(phenotype)
for (i in 1:250) {
  addRegion(im) <- imPoint(e_head250[i], o_head250[i], .065, .2, alt=paste0("point_", i, ",", snpvector[i], ",", pvector[i])) 
}
createPage(im, paste0(phenotype,".imagemap.json"))
imClose(im)
 
