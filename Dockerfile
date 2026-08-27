# Build the CLI from this checkout so source-only connectors are included in the
# deployed artifact instead of being replaced by the published npm package.
FROM node:22.22.3-slim AS build

WORKDIR /app

# The monorepo Nest build can exceed Node's default heap limit.
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY . .

RUN --mount=type=cache,target=/root/.npm \
  npm ci --ignore-scripts --no-audit --no-fund

RUN npm rebuild better-sqlite3 --no-audit --no-fund

RUN npm run build -w owox

RUN npm prune --omit=dev --ignore-scripts \
  && npm cache clean --force

FROM node:22.22.3-slim

WORKDIR /app
COPY --from=build /app /app

ENV NODE_OPTIONS="--no-deprecation"
ENTRYPOINT ["node", "apps/owox/bin/run.js"]
CMD ["serve"]
