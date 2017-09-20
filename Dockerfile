FROM node:8-alpine

WORKDIR /usr/src/app/hublot

COPY package.json .

RUN yarn install

COPY . /usr/src/app/hublot

ENTRYPOINT ["yarn", "start"]
