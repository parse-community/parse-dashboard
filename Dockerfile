############################################################
# Build stage
############################################################
# Runs on the platform of the build machine, also when building the image for
# another platform, so that no code runs under emulation; Node.js running under
# QEMU emulation can crash with an illegal instruction. Builders that don't set
# BUILDPLATFORM, like the legacy Docker builder, run it on their own platform.
FROM --platform=${BUILDPLATFORM:-linux} node:20.19.0-alpine3.20 AS build

RUN apk --no-cache add git
WORKDIR /src

# Copy package.json first to benefit from layer caching
COPY package*.json ./

# Architecture of the image to build, set by BuildKit; builders that don't set
# it build the image for their own platform
ARG TARGETARCH

# Install production dependencies for the image platform without scripts
# otherwise webpack will fail
RUN arch="${TARGETARCH:-$(uname -m)}" \
 && case "$arch" in \
      amd64|x86_64) cpu=x64 ;; \
      arm64|aarch64) cpu=arm64 ;; \
      arm|armv6l|armv7l) cpu=arm ;; \
      ppc64le) cpu=ppc64 ;; \
      s390x) cpu=s390x ;; \
      *) echo "Unsupported target architecture: '$arch'" >&2; exit 1 ;; \
    esac \
 && npm ci --omit=dev --ignore-scripts --os=linux --cpu="$cpu" --libc=musl

# Copy production node_modules aside for later
RUN cp -R node_modules prod_node_modules

# Copy src to have webpack config files ready for install
COPY . /src

# Install remaining dev dependencies
RUN npm ci

# Run all webpack build steps
RUN npm run prepare && npm run build

############################################################
# Release stage
############################################################
# Must not contain RUN instructions, because building the image for another
# platform than the one of the build machine would then require emulation.
FROM node:20.19.0-alpine3.20 AS release
WORKDIR /src

# Copy production node_modules
COPY --from=build /src/prod_node_modules /src/node_modules
COPY --from=build /src/package*.json /src/

# Copy compiled src dirs
COPY --from=build /src/Parse-Dashboard/ /src/Parse-Dashboard/

USER node

ENTRYPOINT ["node", "Parse-Dashboard/index.js"]
