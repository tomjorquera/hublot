FROM node:7.10

RUN mkdir -p /usr/src/app/hublot
WORKDIR /usr/src/app/hublot

COPY package.json /usr/src/app/hublot

RUN npm --version
RUN npm install

COPY . /usr/src/app/hublot

CMD ["node","app.js"]
