# Sets up the plco environment for

FROM centos

RUN yum update -y \
 && curl -sL https://rpm.nodesource.com/setup_12.x | sh \
 && yum install -y gcc-c++ git make nodejs

COPY . /deploy

WORKDIR /deploy

RUN npm install \
 && pushd client \
 && npm install \
 && popd \
 && npm run build

CMD npm start