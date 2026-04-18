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
    python3 \
    make \
    g++ \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# -------------------------
# BUILD
# -------------------------
FROM deps AS build

COPY prisma ./prisma
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

# -------------------------
# PRODUCTION DEPS
# -------------------------
FROM deps AS production-deps
RUN npm prune --omit=dev && npm cache clean --force

# -------------------------
# RUNTIME
# -------------------------
FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/storage && chown -R node:node /app

COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node

EXPOSE 3000

# ⚠️ IMPORTANT : migrations SAFE au démarrage runtime
CMD sh -c "npx prisma migrate deploy && node dist/main.js"