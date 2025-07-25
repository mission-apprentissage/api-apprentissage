FROM node:24-slim AS builder_root
WORKDIR /app
RUN yarn set version 3.3.1
COPY .yarn /app/.yarn
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY .yarnrc.yml .yarnrc.yml
COPY ui/package.json ui/package.json
COPY server/package.json server/package.json
COPY shared/package.json shared/package.json
COPY sdk/package.json sdk/package.json

RUN yarn install --immutable

COPY . .

RUN yarn typecheck

FROM builder_root AS root
WORKDIR /app

##############################################################
######################    SERVER    ##########################
##############################################################

# Rebuild the source code only when needed
FROM root AS builder_server
WORKDIR /app

RUN yarn workspace server build

RUN mkdir -p /app/shared/node_modules && mkdir -p /app/sdk/node_modules && mkdir -p /app/server/node_modules

# Production image, copy all the files and run next
FROM node:24-slim AS server
WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates curl && update-ca-certificates && apt-get clean

ENV NODE_ENV=production

ARG PUBLIC_PRODUCT_NAME
ENV PUBLIC_PRODUCT_NAME=$PUBLIC_PRODUCT_NAME

ARG PUBLIC_VERSION
ENV PUBLIC_VERSION=$PUBLIC_VERSION

COPY --from=builder_server /app/server ./server
COPY --from=builder_server /app/shared ./shared
COPY --from=builder_server /app/sdk ./sdk
COPY --from=builder_server /app/node_modules ./node_modules
COPY --from=builder_server /app/server/node_modules ./server/node_modules
COPY --from=builder_server /app/sdk/node_modules ./sdk/node_modules
COPY --from=builder_server /app/shared/node_modules ./shared/node_modules
COPY ./server/static /app/server/static

EXPOSE 5000
WORKDIR /app/server
ENV NODE_OPTIONS=--max_old_space_size=2048
CMD ["node", "dist/index.js", "start"]


##############################################################
######################      UI      ##########################
##############################################################

# Rebuild the source code only when needed
FROM root AS builder_ui
WORKDIR /app

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

ARG PUBLIC_REPO_NAME
ENV NEXT_PUBLIC_PRODUCT_REPO=$PUBLIC_REPO_NAME

ARG PUBLIC_PRODUCT_NAME
ENV NEXT_PUBLIC_PRODUCT_NAME=$PUBLIC_PRODUCT_NAME

ARG PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$PUBLIC_VERSION

ARG PUBLIC_ENV
ENV NEXT_PUBLIC_ENV=$PUBLIC_ENV

RUN yarn workspace ui build
# RUN --mount=type=cache,target=/app/ui/.next/cache yarn --cwd ui build

# Production image, copy all the files and run next
FROM node:24-slim AS ui
WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates curl && update-ca-certificates && apt-get clean

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

ARG PUBLIC_REPO_NAME
ENV NEXT_PUBLIC_PRODUCT_REPO=$PUBLIC_REPO_NAME

ARG PUBLIC_PRODUCT_NAME
ENV NEXT_PUBLIC_PRODUCT_NAME=$PUBLIC_PRODUCT_NAME

ARG PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$PUBLIC_VERSION

ARG PUBLIC_ENV
ENV NEXT_PUBLIC_ENV=$PUBLIC_ENV

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# You only need to copy next.config.mjs if you are NOT using the default configuration
COPY --from=builder_ui --chown=nextjs:nodejs /app/ui/next.config.mjs /app/
COPY --from=builder_ui --chown=nextjs:nodejs /app/ui/public /app/ui/public
COPY --from=builder_ui --chown=nextjs:nodejs /app/ui/package.json /app/ui/package.json

# Automatically leverage output traces to reduce image size 
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder_ui --chown=nextjs:nodejs /app/ui/.next/standalone /app/
COPY --from=builder_ui --chown=nextjs:nodejs /app/ui/.next/static /app/ui/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "ui/server"]
