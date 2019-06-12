FROM node:8-alpine

COPY ./app/ /eosmonitor/app
COPY ./index.js /eosmonitor/index.js
COPY ./contracts/ /eosmonitor/contracts
COPY ./package.json /eosmonitor/package.json
COPY ./package-lock.json /eosmonitor/package-lock.json

RUN apk add --no-cache --virtual --update git

RUN cd /eosmonitor \
    && npm install

EXPOSE 18888

WORKDIR /eosmonitor

ENTRYPOINT [ "node", "index.js" ]
