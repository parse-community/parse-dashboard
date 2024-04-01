############################################################
# Build stage
############################################################
FROM node:lts-alpine AS build

RUN apk --no-cache add git
WORKDIR /src

# Copy package.json first to benefit from layer caching
COPY package*.json ./

# Install without scripts otherwise webpack will fail
RUN npm ci --omit=dev --ignore-scripts

# Copy production node_modules aside for later
RUN cp -R node_modules prod_node_modules

# Copy src to have webpack config files ready for install
COPY . /src

# Install remaining dev dependencies
RUN npm ci

############################################################
# Build stage v2
############################################################
FROM node:lts-alpine AS v2-build

RUN apk --no-cache add git
WORKDIR /src

# Copy package.json first to benefit from layer caching
COPY v2/package*.json ./

# Install dependencies
RUN npm ci

# Copy src to have webpack config files ready for install
COPY ./v2 ./

# Run build step
RUN npm run build

############################################################
# Release stage
############################################################
FROM node:lts-alpine AS release
WORKDIR /src

# Copy production node_modules
COPY --from=build /src/prod_node_modules /src/node_modules
COPY --from=build /src/package*.json /src/

# Copy compiled src dirs
COPY --from=build /src/Parse-Dashboard/ /src/Parse-Dashboard/
COPY --from=v2-build /Parse-Dashboard/public/v2 /src/Parse-Dashboard/public/v2

USER node

ENTRYPOINT ["node", "Parse-Dashboard/index.js"]
