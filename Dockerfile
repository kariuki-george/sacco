FROM node:16

WORKDIR /var/www/sacco-backend


COPY package.json .

RUN yarn

COPY . .

COPY .env.docker ./.env

EXPOSE 3000

RUN yarn build

CMD yarn start


