FROM node:8-alpine

RUN apk update && apk add openjdk8

RUN mkdir -p /usr/src/app/hublot
WORKDIR /usr/src/app/hublot
RUN mkdir -p ./tmp

COPY package.json /usr/src/app/hublot

RUN npm install
RUN npm run setup

COPY . /usr/src/app/hublot

RUN chmod +x start.sh

CMD ./start.sh
