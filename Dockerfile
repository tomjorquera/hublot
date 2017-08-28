FROM node:8-stretch

RUN apt-get -q update && apt-get -y -q install \
     openjdk-8-jre-headless \
     libgconf-2-4 \
     curl \
     xvfb \
     chromium \
  && npm set -g progress=false

RUN mkdir -p /usr/src/app/hublot
WORKDIR /usr/src/app/hublot

COPY . /usr/src/app/hublot
RUN npm install

RUN npm run setup

RUN chmod +x start.sh

ADD docker-chromium-xvfb/xvfb-chromium /usr/bin/xvfb-chromium
RUN ln -s /usr/bin/xvfb-chromium /usr/bin/google-chrome
RUN ln -s /usr/bin/xvfb-chromium /usr/bin/chromium-browser

CMD ./start.sh
