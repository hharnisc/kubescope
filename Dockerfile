FROM node:9.2.0-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package.json /usr/src/app
RUN yarn install

COPY src /usr/src/app/src/
COPY public /usr/src/app/public/
COPY server /usr/src/app/server/

RUN yarn run build

EXPOSE 3000

CMD yarn run start
