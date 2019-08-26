qq <- function(o, e, pvector, ...) {
  # png("ewings_sarcoma.png", width = 800, height = 800, units = "px", pointsize = 15)
  # o <- -log10(sort(pvector,decreasing=F))
  # e <- -log10(ppoints(length(pvector)))
  
  o_head250 <- o[1:250]
  e_head250 <- e[1:250]
  o_tail <- o[251:length(o)]
  e_tail <- e[251:length(e)]
  
  plot(x=e_head250, y=o_head250,
       pch=19, ann=FALSE,
       col="orange",
       # xlab=expression(Expected~~-log[10](italic(p))), ylab=expression(Observed~~-log[10](italic(p))), ## title for x and y axis
       xlim=c(0, max(e)), ylim=c(0, max(o)),
       cex.axis=1.00, bty="l", ...)
  
  box(which = "plot", lty = "solid", bty="l", lwd=1, col="#000000", ...)
  
  points(x=e_tail, y=o_tail,
         col="blue")
  
  abline(0, 1, col="gray")
  # mtext(paste("lambdaGC =", round(qchisq(1 - median(pvector), 1) / qchisq(0.5, 1), 4)), line=-1)
  # mtext(paste("N =", length(o_head250) + length(o_tail)))
  title(xlab=expression(bold(Expected~~-log[10](p))), cex.lab=1.15, line=3)
  title(ylab=expression(bold(Observed~~-log[10](p))), cex.lab=1.15, line=2)
  title(xlab=paste("lambdaGC =", round(qchisq(1 - median(pvector), 1) / qchisq(0.5, 1), 4)), cex.lab=1.5, line=-46)
  title(xlab=paste("N =", length(o_head250) + length(o_tail)), cex.lab=1.5, line=-48)
  # dev.off()
}

query <- function(phenotype) {
  library("RSQLite")
  source("qqplot-imagemap-builder.R")
  # init imagemap
  im <- imagemap(phenotype,height=800,width=800)  
  # init phenotype db filename
  filename <- paste0("../data/",phenotype,".db")
  # query db
  sqlite.driver <- dbDriver("SQLite")
  conn <- dbConnect(sqlite.driver, dbname = filename)
  dbListTables(conn)
  query <- dbGetQuery(conn, "SELECT snp, p FROM variant WHERE nlog_p >= 3 ORDER BY p DESC")
  # query <- dbGetQuery(conn, "SELECT snp, p FROM variant ORDER BY p DESC")
  pvector <- query[['p']]
  snpvector <- query[['snp']]
  pvector <- pvector[!is.na(pvector) & pvector<1 & pvector>0]
  dbDisconnect(conn)
  # store pvector lists and first 250 observable markers in lists
  o <- -log10(sort(pvector,decreasing=F))
  e <- -log10(ppoints(length(pvector)))
  o_head250 <- o[1:250]
  e_head250 <- e[1:250]
  snpvector_head250 <- snpvector[1:250]
  # generate image
  qq(o, e, pvector)
  # generate imagemap
  for (i in 1:250) {
    addRegion(im) <- imPoint(e_head250[i], o_head250[i], .065, .2, alt=paste0("point_", i, ",", snpvector[i], ",", pvector[i]))
  }
  createPage(im, paste0(phenotype,".imagemap.json"))
  imClose(im)
}
