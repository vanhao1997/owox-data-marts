FROM node:22-slim

# Prepare standard build tools for native modules
RUN apt-get update && \
    apt-get install -y python3 make g++ git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy all source code (.dockerignore excludes node_modules, .git etc.)
COPY . .

# Install dependencies (bypass engine-strict, allow legacy peer deps)
RUN echo "engine-strict=false" > .npmrc && \
    npm install --legacy-peer-deps && \
    npm install rxjs@7 --legacy-peer-deps --no-save

# Build only the owox CLI and its runtime deps (web, backend, etc.)
RUN cd apps/owox && npm run build:dep && npm run build

# Clear caches to reduce image size
RUN npm cache clean --force

ENV NODE_OPTIONS="--no-deprecation"

EXPOSE 3000
EXPOSE 8080

ENTRYPOINT ["node", "apps/owox/bin/run.js"]
CMD ["serve"]
