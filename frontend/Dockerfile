FROM node:20

WORKDIR /frontend

COPY . .

ENV PORT=8080

RUN yarn
RUN yarn build

CMD ["yarn", "run", "dev"]

EXPOSE 8080
