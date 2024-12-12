
FROM node:18-alpine

WORKDIR /code

COPY chatterbox/ /code/
COPY chatterbox/package.json /code/package.json

RUN npm install

ENV PORT=3000

CMD [ "npm", "start" ]
