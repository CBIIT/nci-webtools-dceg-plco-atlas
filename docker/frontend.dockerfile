FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS builder

# Use bash with pipefail so a failed curl/download in a piped command fails
# the RUN step instead of silently falling back to AL2023's default (Node 18).
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# AL2023's dnf repo only ships Node.js 18.x; use NodeSource to install a
# supported LTS release (Node 24.22.1) instead.
RUN dnf -y update \
   && dnf -y install gcc-c++ make \
   && curl -fsSL https://rpm.nodesource.com/setup_24.x | bash - \
   && dnf -y install nodejs-24.22.1 \
   && dnf clean all

# Run the version assertion as its own step so it only ever runs after the
# install above has already succeeded (avoids ambiguous failures/output if an
# earlier command in the install chain fails).
RUN test "$(node -v)" = 'v24.22.1' || (echo "Expected Node v24.22.1, got: $(node -v)" && exit 1)

# The lockfile is generated with npm 10
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

# Runtime image: only httpd and the built static files (no Node/npm/build tools)
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# python3 is only present as a dependency of dnf and has no patched AL2023
# release, so remove dnf and python3 once the packages are installed.
RUN dnf -y update \
   && dnf -y install httpd \
   && dnf clean all \
   && rpm -e --nodeps $(rpm -qa 'python3*') yum dnf dnf-data \
   && rm -rf /var/cache/dnf /var/lib/dnf

COPY --from=builder /var/www/html/ /var/www/html/

WORKDIR /var/www/html

# Add custom httpd configuration
COPY docker/frontend.conf /etc/httpd/conf.d/frontend.conf

EXPOSE 80
EXPOSE 443

CMD rm -rf /run/httpd/* /tmp/httpd* \
   && exec /usr/sbin/httpd -DFOREGROUND
