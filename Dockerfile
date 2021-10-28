#
# --- Base Node Image ---
FROM node:lts-alpine AS base

RUN apk update; \
  apk add git;

WORKDIR /src

# Copy package.json first to benefit from layer caching
COPY package*.json ./
RUN npm install --only=production
# Copy production node_modules aside for later
RUN cp -R node_modules prod_node_modules
# Install remaining dev dependencies
RUN npm install

COPY . /src

# Run all webpack build steps
RUN npm run prepare && npm run build


#
# --- Production Image ---
FROM node:lts-alpine AS release
WORKDIR /src

# Copy production node_modules
COPY --from=base /src/prod_node_modules /src/node_modules
COPY --from=base /src/package*.json /src/

# Copy compiled src dirs
COPY --from=base /src/Parse-Dashboard/ /src/Parse-Dashboard/

USER node

ENTRYPOINT ["node", "Parse-Dashboard/index.js"]
