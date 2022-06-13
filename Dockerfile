FROM node:16

WORKDIR /var/www/sacco-backend


COPY package.json .

RUN npm i

COPY . .

COPY .env.docker ./.env

EXPOSE 3000

RUN npm run build

CMD npm run start


