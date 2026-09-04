ARG PLAYWRIGHT_BASE_IMAGE=mcr.microsoft.com/playwright:v1.62.1-noble@sha256:dcc5531e97840b9b5e794f2814476b21571c5124a3fca2267d73041f56e7580e
FROM ${PLAYWRIGHT_BASE_IMAGE}

WORKDIR /app
ARG revision=unknown
ARG version=local
LABEL org.opencontainers.image.revision="${revision}"
LABEL org.opencontainers.image.version="${version}"
LABEL org.opencontainers.image.source="https://github.com/vanhao1997/p2pdigital-data-marts"
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY src ./src
ENV NODE_ENV=production
ENV PORT=8091
EXPOSE 8091
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD node -e "const port=process.env.PORT||8091;fetch('http://127.0.0.1:'+port+'/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
