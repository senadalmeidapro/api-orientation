# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS base
WORKDIR /app

ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

# -------------------------
# DEPENDENCIES
# -------------------------
FROM base AS deps

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json npm-shrinkwrap.json ./
RUN npm ci

# -------------------------
# BUILD
# -------------------------
FROM deps AS build

COPY prisma ./prisma
RUN npx prisma generate

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm run build

# -------------------------
# PROD DEPENDENCIES
# -------------------------
FROM deps AS prod-deps
RUN npm prune --omit=dev && npm cache clean --force

# -------------------------
# RUNTIME
# -------------------------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/storage && chown -R node:node /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
# 👇 Le client Prisma généré (absent de prod-deps)
COPY --from=build --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy; echo 'migrate exit: '$?;"]