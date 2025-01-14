FROM node:14

ENV NODE_ENV "production"
ENV SALTCORN_DISABLE_UPGRADE "true"

RUN npm install -g @saltcorn/cli@0.5.0 --unsafe

ENTRYPOINT ["/usr/local/bin/saltcorn serve"]
