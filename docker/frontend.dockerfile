FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# Use bash with pipefail so a failed curl/download in a piped command fails
# the RUN step instead of silently falling back to AL2023's default (Node 18).
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# AL2023's dnf repo only ships Node.js 18.x; use NodeSource to install a
# supported current LTS release (Node 24) instead.
RUN dnf -y update \
   && dnf -y install gcc-c++ httpd make \
   && curl -fsSL https://rpm.nodesource.com/setup_24.x | bash - \
   && dnf -y install nodejs \
   && dnf clean all \
   && node -v | grep -q '^v24\.' || (echo "Expected Node 24, got: $(node -v)" && exit 1)

RUN mkdir /client

WORKDIR /client

COPY client/package*.json /client/

RUN npm ci

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