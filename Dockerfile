FROM keymetrics/pm2:8-alpine
MAINTAINER priotix

RUN apk add --no-cache python build-base

COPY package.json package-lock.json /tmp/api-storage/

RUN cd /tmp/api-storage && npm install
RUN npm cache clean --force

RUN mkdir -p /var/www/api-storage && cp -a /tmp/api-storage/node_modules /var/www

WORKDIR /var/www/api-storage
ADD . /var/www/api-storage

CMD pm2-runtime start pm2.config.json --env ${NODE_ENV}
