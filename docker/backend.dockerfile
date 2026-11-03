FROM public.ecr.aws/docker/library/node:24-alpine AS builder

WORKDIR /server

COPY server/package.json /server/package.json

RUN npm install --omit=dev --no-audit --no-fund

FROM public.ecr.aws/docker/library/node:24-alpine

# The application only needs the node binary at runtime; remove the package
# managers (and their bundled dependencies) so they are not shipped.
RUN apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
       /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
       /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg \
    && mkdir -p /server /logs

WORKDIR /server/

COPY server /server/
COPY --from=builder /server/node_modules /server/node_modules

CMD ["node", "server.js"]
