FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS builder

# Use bash with pipefail so a failed curl/download in a piped command fails
# the RUN step instead of silently falling back to AL2023's default (Node 18).
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# AL2023's dnf repo only ships Node.js 18.x; use NodeSource to install a
# supported current LTS release (Node 24) instead.
RUN dnf -y update \
    && dnf -y install gcc-c++ make \
    && curl -fsSL https://rpm.nodesource.com/setup_24.x | bash - \
    && dnf -y install nodejs \
    && dnf clean all

# Run the version assertion as its own step so it only ever runs after the
# install above has already succeeded (avoids ambiguous failures/output if an
# earlier command in the install chain fails).
RUN node -v | grep -q '^v24\.' || (echo "Expected Node 24, got: $(node -v)" && exit 1)

WORKDIR /server

COPY server/package.json /server/package.json

RUN npm install --omit=dev --no-audit --no-fund

# Runtime image: only Node and the installed production dependencies
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# python3 is only present as a dependency of dnf and has no patched AL2023
# release, so remove dnf and python3 once Node is installed. npm (and its
# bundled dependencies) is not needed at runtime either.
RUN dnf -y update \
    && curl -fsSL https://rpm.nodesource.com/setup_24.x | bash - \
    && dnf -y install nodejs \
    && dnf clean all \
    && node -v | grep -q '^v24\.' \
    && rm -rf /usr/lib/node_modules/npm /usr/lib/node_modules/corepack \
       /usr/bin/npm /usr/bin/npx /usr/bin/corepack \
    && rpm -e --nodeps $(rpm -qa 'python3*') yum dnf dnf-data \
    && rm -rf /var/cache/dnf /var/lib/dnf \
    && mkdir -p /server /logs

WORKDIR /server/

COPY server /server/
COPY --from=builder /server/node_modules /server/node_modules

CMD ["node", "server.js"]
