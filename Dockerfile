FROM node:8

RUN echo "deb http://httpredir.debian.org/debian jessie-backports main" > /etc/apt/sources.list.d/jessie-backports.list \
  && apt-get -q update && apt-get -y -q -t jessie-backports install \
     chromium \
     xvfb \
     openjdk-8-jre-headless \
     libgconf-2-4 \
  && npm set -g progress=false

RUN mkdir -p /usr/src/app/hublot
WORKDIR /usr/src/app/hublot

COPY . /usr/src/app/hublot
RUN npm install

RUN npm run setup

RUN chmod +x start.sh

CMD ./start.sh
