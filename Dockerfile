FROM node:8-slim
ENV NPM_CONFIG_LOGLEVEL error
WORKDIR /src
ADD . /src
RUN cd /src \
 && npm install \
 && npm run build \
 && npm cache clear --force \
 && rm -rf ~/.npm \
 && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["npm", "run", "dashboard"]
