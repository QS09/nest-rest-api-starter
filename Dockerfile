FROM node:16.15-alpine as development
 
WORKDIR /api

COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./yarn.lock ./yarn.lock
RUN yarn install 

COPY --chown=node:node . .
RUN yarn build

ENTRYPOINT ["node", "dist/main"]
