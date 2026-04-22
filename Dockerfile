FROM node:22-slim

# Prepare standard build tools for native modules
RUN apt-get update && \
    apt-get install -y python3 make g++ git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json .npmrc ./
COPY apps/owox/package.json ./apps/owox/
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install all dependencies (bypass strict engine check)
RUN echo "engine-strict=false" > .npmrc && \
    npm install --legacy-peer-deps

# Now copy all source code
COPY . .

# Build only the owox CLI and its runtime deps (web, backend, etc.)
# This uses the prebuild script in apps/owox which selectively builds
# each dependency without running full monorepo type-checks
RUN cd apps/owox && npm run build:dep && npm run build

# Clear caches
RUN npm cache clean --force

ENV NODE_OPTIONS="--no-deprecation"

EXPOSE 3000
EXPOSE 8080

ENTRYPOINT ["node", "apps/owox/bin/run.js"]
CMD ["serve"]
