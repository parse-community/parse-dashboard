#
# --- Base Node Image ---
FROM node:8-alpine AS base

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
RUN npm run prepublish && npm run build


#
# --- Production Image ---
FROM node:8-alpine AS release
WORKDIR /src

# Copy production node_modules
COPY --from=base /src/prod_node_modules /src/node_modules
COPY --from=base /src/package*.json /src/

# Copy compiled src dirs
COPY --from=base /src/Parse-Dashboard/ /src/Parse-Dashboard/

ENTRYPOINT ["node", "Parse-Dashboard/index.js"]
