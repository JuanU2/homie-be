# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Base image: Node LTS + pnpm pinned to the repo's packageManager version.
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS base
RUN npm install -g pnpm@10.15.1
WORKDIR /app

# ---------------------------------------------------------------------------
# Build stage: install ALL workspace deps (including dev deps) and build the
# whole monorepo (packages first, then apps, via `turbo run build`).
# ---------------------------------------------------------------------------
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm build

# ---------------------------------------------------------------------------
# Production stage: install prod deps only, then copy the built artifacts.
# The image contains BOTH apps; each is started with a different `command`.
# ---------------------------------------------------------------------------
FROM base AS prod
ENV NODE_ENV=production
WORKDIR /app

# Workspace manifests (required by pnpm to resolve the workspace).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/core/package.json ./apps/core/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/events/package.json ./packages/events/package.json
COPY packages/images/package.json ./packages/images/package.json

RUN pnpm install --frozen-lockfile --prod

# Built apps and built workspace packages.
COPY --from=build /app/apps/core/dist ./apps/core/dist
COPY --from=build /app/apps/worker/dist ./apps/worker/dist
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/events/dist ./packages/events/dist
COPY --from=build /app/packages/images/dist ./packages/images/dist

EXPOSE 3001 3002

# Default entrypoint (overridden per-service in docker-compose.yml).
CMD ["node", "apps/core/dist/main.js"]
