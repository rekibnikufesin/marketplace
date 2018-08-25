FROM node:10.9.0-stretch

COPY . /app
COPY ./build /app/src/
WORKDIR /app

RUN npm install
RUN npm install truffle -g


EXPOSE 3000

CMD ["npm", "start"]
