FROM public.ecr.aws/docker/library/node:24 AS builder

RUN node -v | grep -q '^v24\.' || (echo "Expected Node 24, got: $(node -v)" && exit 1)
RUN npm install --global npm@10.8.2 --no-audit --no-fund

RUN mkdir /client

WORKDIR /client

COPY client/package*.json /client/

RUN npm ci

COPY client/ /client/
COPY client/.env.development /client/.env.development

ARG REACT_APP_VERSION=docker
ARG REACT_APP_DEPLOYMENT_DATE=Unknown
ENV REACT_APP_VERSION=${REACT_APP_VERSION}
ENV REACT_APP_DEPLOYMENT_DATE=${REACT_APP_DEPLOYMENT_DATE}

RUN npm run build \
   && mkdir -p /var/www/html/ \
   && cp -r /client/build/* /var/www/html/

FROM public.ecr.aws/docker/library/httpd:2.4-alpine

# perl and libxml2 are only needed by apxs/dbmmanage and the (unused)
# mod_proxy_html/mod_xml2enc modules, and have no patched Alpine release yet.
# The base image pins libxml2 through the .httpd-so-deps virtual package, so
# re-pin the remaining runtime libraries before removing it.
RUN apk upgrade --no-cache \
    && rm -f /usr/local/apache2/bin/apxs /usr/local/apache2/bin/dbmmanage \
       /usr/local/apache2/modules/mod_proxy_html.so /usr/local/apache2/modules/mod_xml2enc.so \
    && apk add --no-cache --virtual .httpd-keep \
       $(apk info -R .httpd-so-deps | sed 1d | tr -d ' ' | grep -v libxml2) \
    && apk del .httpd-so-deps perl

COPY --from=builder /var/www/html/ /usr/local/apache2/htdocs/
COPY docker/frontend.conf /usr/local/apache2/conf/extra/frontend.conf

RUN sed -i \
      -e 's/^#LoadModule rewrite_module/LoadModule rewrite_module/' \
      -e 's/^#LoadModule remoteip_module/LoadModule remoteip_module/' \
      -e 's/^#LoadModule proxy_module/LoadModule proxy_module/' \
      -e 's/^#LoadModule proxy_http_module/LoadModule proxy_http_module/' \
      /usr/local/apache2/conf/httpd.conf \
    && printf '\nInclude conf/extra/frontend.conf\n' >> /usr/local/apache2/conf/httpd.conf

EXPOSE 80