FROM public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf -y update \
   && dnf -y install \
   gcc-c++ \
   httpd \
   make \
   nodejs \
   npm \
   && dnf clean all

RUN mkdir /client

WORKDIR /client

COPY client/package*.json /client/

RUN npm install 

COPY client/ /client/
COPY client/.env.development /client/.env.development

ARG REACT_APP_VERSION=docker
ENV REACT_APP_VERSION=${REACT_APP_VERSION}

RUN npm run build \
   && mkdir -p /var/www/html/ \
   && cp -r /client/build/* /var/www/html/

WORKDIR /var/www/html

# Add custom httpd configuration
COPY docker/frontend.conf /etc/httpd/conf.d/frontend.conf

EXPOSE 80
EXPOSE 443

CMD rm -rf /run/httpd/* /tmp/httpd* \
   && exec /usr/sbin/httpd -DFOREGROUND