# Sets up the plco environment for


FROM public.ecr.aws/amazonlinux/amazonlinux:2022

RUN dnf -y update \
 && dnf -y install \
    make \
    gcc-c++ \
    nodejs \
    npm \
 && dnf clean all

COPY . /deploy

WORKDIR /deploy

RUN npm install \
 && pushd client \
 && npm install \
 && popd \
 && npm run build

CMD npm start