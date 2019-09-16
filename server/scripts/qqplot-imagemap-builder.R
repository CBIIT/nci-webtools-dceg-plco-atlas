#######################################
#######################################
# Produce HTML imagemap code from R   #
#######################################
# B.Rowlingson@lancaster.ac.uk        #
#######################################
# Inspired by an email from Landon    #
# Jensen <lsjensen@micron.com> on the #
# R-help mailing list Dec 2002        #
# Probably none of that code here now #
#######################################

#######################################
#######################################
# Edited to export JSON QQ-plot data  #
#######################################
# kevin.jiang2@nih.gov                #
#######################################
# Inspired by imagemap.R by           #
# B.Rowlingson@lancaster.ac.uk        #
#######################################

imagemap <- function(filename,width=480,height=480,title='Imagemap from R'){
  png(paste(filename,".png",sep=''),width=width,height=height)
  im <- list()
  im$Device <- dev.cur()
  im$Filename=filename
  im$Height=height
  im$Width=width
  im$Objects <- list()
  im$HTML <- list()
  im$title <- title
  class(im) <- "imagemap"
  im
}

print.imagemap <- function(x,...){
  cat("Its an imagemap!: ",x$title,"\n")
}

createPage <- function(im, file='', lambdaGC='0.0', sampleSize='0', imgTags=list()){
  out <- ""
  out <- c(out, buildIM(im, imgTags, lambdaGC, sampleSize))
  cat(out,file=file,sep='')
}

buildIM <- function(im, imgTags=list(), lambdaGC, sampleSize){
  out <- "{\n"
  out <- c(out, paste0("\"lambdaGC\": \"", lambdaGC, "\",\n"))
  out <- c(out, paste0("\"sampleSize\": \"", sampleSize, "\",\n"))
  out <- c(out, "\"areaItems\": [\n")
  data <- c()
  for(region in im$HTML){
    data <- c(data,toHTML(region,im))
  }
  out <- c(out, str_c(data, collapse = ",\n"))
  # out <- c(out,"</map>\n")
  out <- c(out, "\n]\n}\n")
  
  return(out)
}

createIM <- function(im,file='',imgTags=list()){
  cat(buildIM(im,imgTags),sep='\n',file=file)
}

imClose <- function(im){
  cat(paste("Closing PNG file ",paste(im$Filename,".png",sep=''),"\n",sep=''))
  dev.off(im$Device)
}

lines.imagemap <- function(x,...){
  ### draw the imagemap objects on the current plot
  ### uses the original stored coordinates
  ###
  lapply(x$Objects,lines,...)
  invisible(0)
}

lines.imDefault <- function(x,...){
  cat("Default defined\n")
}

lines.imPoly <- function(x,...){
  lines(rbind(x$xy,x$xy[1,]),...)
}

lines.imCircle <- function(x,...){
  symbols(x$xc,x$yc,circles=x$r,inches=F,add=T,...)
}

lines.imRect <- function(x,...){
  rect(x$xleft,x$ybottom,x$xright,x$ytop,...)
}



"addRegion<-" <- function(im,value){
  
  im$HTML[[length(im$HTML)+1]] <- toHTML(value,im)
  im$Objects[[length(im$Objects)+1]] <- value
  return(im)
  
}

toHTML <- function(ob,im){
  UseMethod("toHTML")
}

toHTML.default <- function(ob,im){
  ob
}

toHTML.imagemap <- function(ob,im){
  out <- paste("<img src=\"",paste(ob$Filename,".png",sep=''),"\" usemap=\"#",ob$Filename,"\" ISMAP\n>",sep='')
  out <- c(out,paste("<map name=\"",ob$Filename,"\">\n",sep=''))
  for(region in ob$HTML){
    out <- c(out,toHTML(region,ob))
  }
  out <- c(out,"</map>\n")

  out
}

toHTML.imPoly <- function(ob,im){
  xyt <- usr2png(ob$xy,im)
  coords <- paste(t(xyt),sep='',collapse=',')
  line <- paste("<area shape=\"poly\" coords=\"",coords,"\" ",sep='')
  line <- paste(line, moHTML(ob$extra), " >\n",sep='')
  line
}

toHTML.imCircle <- function(ob,im){
  xyrc <- usr2png(cbind(c(ob$xc,ob$r,0),c(ob$yc,0,0)),im)
  r <- abs(xyrc[2,1]-xyrc[3,1])
  coords <- paste(paste(xyrc[1,1],xyrc[1,2],sep=','),r,sep=',')
  line <- paste("<area shape=\"circle\" coords=\"",coords,"\" ",sep='')
  line <- paste(line, moHTML(ob$extra), " >\n",sep='')
  line
}

toHTML.imRect <- function(ob,im){
  xycorns <- usr2png(rbind(c(ob$xleft,ob$ytop),c(ob$xright,ob$ybottom)),im)
  coords <- paste(xycorns[1,1],xycorns[2,2],xycorns[2,1],xycorns[1,2],sep=",")
  line <- paste0("{ \"shape\": \"rect\", ", "\"coords\": \"", coords,"\", ", moHTML(ob$extra), " }")
  line
}

toHTML.imText <- function(ob,im){
  ## compute coords of unrotated bbox of text in usr space
  xl <- ob$x-ob$width*ob$adj[1]
  xr <- xl+ob$width
  yb <- ob$y-ob$height*ob$adj[2]
  yt <- yb+ob$height
  
  ## compute coords of unrotated box and rotation point
  ## in fractional pixel space
  xy <- usr2dev(cbind(c(ob$x,xl,xr,xr,xl),c(ob$y,yb,yb,yt,yt)),im$Device)
  xy[,1] <- xy[,1]*im$Width
  xy[,2] <- xy[,2]*im$Height
  
  ## rotate corners
  corners <- rbind(xy[2:5,1]-xy[1,1],xy[2:5,2]-xy[1,2])
  rot <- pi*(-ob$srt)/180
  rmat <- rbind(c(cos(rot),sin(rot)),c(-sin(rot),cos(rot)))
  rotted <- rmat %*% corners
  ## convert to integer pixel coords wrt top left:
  xyt <- cbind(rotted[1,]+xy[1,1],(im$Height-(rotted[2,]+xy[1,2])))
  xyt <- ceiling(xyt)
  ## make a POLY object:
  coords <- paste(t(xyt),sep='',collapse=',')
  line <- paste("<area shape=\"poly\" coords=\"",coords,"\" ",sep='')
  line <- paste(line, moHTML(ob$extra), " >\n",sep='')
  line
}

toHTML.imDefault <- function(ob,im){
  return( paste("<area shape=\"default\" ",moHTML(ob$extra)," >\n",sep='') )
}

moHTML <- function(alist){
  tagline <- ""
  if(length(alist)==0){return("")}
  for(itag in 1:length(alist)){
    value <- alist[[itag]]
    name <- names(alist)[itag]
    ctag <- paste("\"",name,"\"",": \"",value,"\" ",sep='')
    tagline <- paste(tagline,ctag,sep='')
  }
  tagline
}


####### functions to define different region types.
####    should validate their args..

imPoint <- function(x,y,w,h,...){
  ## really a rectangle 
  imRect(x-(w/2),y+(h/2),x+(w/2),y-(h/2),...)
}

imRect <- function(xleft,ytop,xright,ybottom,...){
  res <- list(type="rect",xleft=xleft,ytop=ytop,xright=xright,ybottom=ybottom,
              extra=list(...))
  class(res) <- c("imRegion","imRect")
  res
}

imCircle <- function(xc,yc,r,...){
  res <- list(type="circle",xc=xc,yc=yc,r=r,extra=list(...))
  class(res) <- c("imRegion","imCircle")
  res
}

imPoly <- function(xy,...){
  res <- list(type="poly",xy=xy,extra=list(...))
  class(res) <- c("imRegion","imPoly")
  res
}

imDefault <- function(...){
  res <- list(type="default",extra=list(...))
  class(res) <- c("imRegion","imDefault")
  res
}

imText <- function(x,y,string,pars=par(),...){
  
  ## get adj from pars or par()
  if(!is.null(pars$adj)){
    adj <- pars$adj
  }else{
    adj <- par("adj")
  }
  if(length(adj)==1){adj <- c(adj,.5)}
  ## adj is now length 2
  
  ## get srt from pars or par()
  if(!is.null(pars$srt)){
    srt <- pars$srt
  }else{
    srt <- par("srt")
  }
  
  res <- list(x=x,y=y,
              width=strwidth(string),height=strheight(string),
              string=string, adj=adj,srt=srt,
              extra=list(...)
  )
  class(res) <- c("imRegion","imText")
  res
}



#########################
####### functions for transformations between various coord systems
#########################

usr2png <- function(xy,im){
  ### convert usr coords (as used in current plot) to pixels in a png
  ### with width/height stored in im
  
  xy <- usr2dev(xy,dev.cur())
  
  cbind(
    ceiling(xy[,1]*im$Width),
    ceiling((1-xy[,2])*im$Height)
  )
}

usr2plt <- function(xy,dev=dev.cur()){
  olddev <- dev.cur()
  dev.set(dev)
  usr <- par("usr")
  dev.set(olddev)
  xytrans(xy,usr)
}

plt2fig <- function(xy,dev=dev.cur()){
  olddev <- dev.cur()
  dev.set(dev)
  plt <- par("plt")
  dev.set(olddev)
  xytrans2(xy,plt)
}

fig2dev <- function(xy,dev=dev.cur()){
  olddev <- dev.cur()
  dev.set(dev)
  fig <- par("fig")
  dev.set(olddev)
  xytrans2(xy,fig)
}

usr2dev <- function(xy,dev=dev.cur()){
  fig2dev(plt2fig(usr2plt(xy,dev),dev),dev)
}



xytrans2 <- function(xy,par){
  cbind(par[1]+((par[2]-par[1])*xy[,1]),
        par[3]+((par[4]-par[3])*xy[,2]))
}  

xytrans <- function(xy,par){
  cbind((xy[,1]-par[1])/(par[2]-par[1]),
        (xy[,2]-par[3])/(par[4]-par[3]))
}