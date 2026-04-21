FROM node:22-slim

# Prepare standard build tools
RUN apt-get update && \
    apt-get install -y python3 make g++ git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the entire workspace
COPY . .

# Bypass strict engine checks to ensure stable container installations
RUN npm install --engine-strict=false --legacy-peer-deps

# Build the entire monorepo workspaces
RUN npm run build

# Clear module cache to save layer space
RUN npm cache clean --force

ENV NODE_OPTIONS="--no-deprecation"

# Expose backend and frontend default ports (Optional but good practice)
EXPOSE 3000
EXPOSE 8080

# Execute the CLI directly from the source code
ENTRYPOINT ["node", "apps/owox/bin/run.js"]
CMD ["serve"]
