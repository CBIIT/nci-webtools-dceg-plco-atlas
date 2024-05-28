FROM public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf -y update \
    && dnf -y install \
    gcc-c++ \
    make \
    nodejs \
    npm \
    && dnf clean all

RUN mkdir -p /deploy/server /deploy/logs

# copy the rest of the application
#COPY server/config*.json /deploy/server/
COPY server /deploy/server/

WORKDIR /deploy/server/

RUN npm install 

CMD npm start
