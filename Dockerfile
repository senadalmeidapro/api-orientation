# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

FROM base AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
RUN apt-get update -y && apt-get install -y openssl
COPY package.json npm-shrinkwrap.json ./
RUN npm ci

FROM deps AS build
COPY prisma ./prisma
RUN npx prisma generate
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM build AS production-deps
RUN npm prune --omit=dev && npm cache clean --force

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN mkdir -p /app/storage && chown -R node:node /app

COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node
EXPOSE 3000
RUN npx prisma migrate deploy
RUN npx prisma db seed
CMD ["node", "dist/main.js"]
