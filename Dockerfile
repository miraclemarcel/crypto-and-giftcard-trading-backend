###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20.9.0-alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node yarn.lock ./
COPY --chown=node:node package*.json ./

RUN yarn install --frozen-lockfile


COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20.9.0-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node yarn.lock ./
COPY --chown=node:node package*.json ./



COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .



ENV NODE_ENV production

RUN yarn install --frozen-lockfile --production && yarn cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:20.9.0-alpine AS production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build . .
COPY --chown=node:node . .


CMD [ "node", "./server.js" ]
