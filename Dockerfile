FROM node:22-slim

# Prepare standard build tools for native modules
RUN apt-get update && \
    apt-get install -y python3 make g++ git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the entire workspace source first for proper npm workspace resolution
COPY . .

# Override engine-strict and install using lockfile for deterministic deps
RUN echo "engine-strict=false" > .npmrc && \
    npm ci --ignore-scripts || npm install

# Run postinstall scripts after full install
RUN npm rebuild 2>/dev/null || true

# Build only the owox CLI and its runtime deps (web, backend, etc.)
RUN cd apps/owox && npm run build:dep && npm run build

# Clear caches
RUN npm cache clean --force

ENV NODE_OPTIONS="--no-deprecation"

EXPOSE 3000
EXPOSE 8080

ENTRYPOINT ["node", "apps/owox/bin/run.js"]
CMD ["serve"]
