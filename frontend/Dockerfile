
FROM node:18-alpine

WORKDIR /code

COPY chatterbox/ /code/
COPY chatterbox/package.json /code/package.json

RUN npm install
RUN npm run build
RUN npm install -g serve

ENV PORT=3000

CMD [ "serve", "-s", "build" ]
