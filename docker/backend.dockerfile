FROM public.ecr.aws/amazonlinux/amazonlinux:2023

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

RUN mkdir -p /server /logs

# copy the rest of the application
#COPY server/config*.json /deploy/server/
COPY server /server/

WORKDIR /server/

RUN npm install 

CMD npm start
