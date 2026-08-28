# The source checkout is built and tested before release. Overlaying only the
# generated runtime artifacts keeps Coolify's source deployment below its
# hard-coded SSH timeout while retaining the official runtime dependencies.
FROM ghcr.io/owox/owox-data-marts:latest

COPY deploy/owox-runtime-artifacts.tar.gz /tmp/owox-runtime-artifacts.tar.gz
RUN tar -xzf /tmp/owox-runtime-artifacts.tar.gz -C /tmp \
  && cp -a /tmp/packages/connectors/dist/. /usr/local/lib/node_modules/owox/node_modules/@owox/connectors/dist/ \
  && cp -a /tmp/packages/idp-protocol/dist/. /usr/local/lib/node_modules/owox/node_modules/@owox/idp-protocol/dist/ \
  && cp -a /tmp/packages/idp-better-auth/dist/. /usr/local/lib/node_modules/owox/node_modules/@owox/idp-better-auth/dist/ \
  && cp -a /tmp/apps/backend/dist/. /usr/local/lib/node_modules/owox/node_modules/@owox/backend/dist/ \
  && cp -a /tmp/apps/web/dist/. /usr/local/lib/node_modules/owox/node_modules/@owox/web/dist/ \
  && cp -a /tmp/apps/owox/dist/. /usr/local/lib/node_modules/owox/dist/ \
  && rm -rf /tmp/packages /tmp/apps /tmp/owox-runtime-artifacts.tar.gz
