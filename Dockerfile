FROM node:8-stretch

RUN apt-get -q update && apt-get -y -q install \
     chromium \
     libgconf-2-4 \
     openjdk-8-jre-headless \
     xvfb \
  && npm set -g progress=false \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app/hublot

COPY package.json .

RUN npm install
RUN npm run setup

COPY xvfb-chromium /usr/bin/xvfb-chromium
RUN ln -s /usr/bin/xvfb-chromium /usr/bin/google-chrome && \
    ln -s /usr/bin/xvfb-chromium /usr/bin/chromium-browser

COPY . /usr/src/app/hublot
RUN chmod +x start.sh

CMD ./start.sh
