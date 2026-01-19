#!/usr/bin/env bash

set -euo pipefail

VERSION=${1:?"Veuillez préciser la version à build"}

COMMIT_ID=$(git rev-parse --short HEAD)
PREV_COMMIT_ID=$(git rev-parse --short HEAD^1)

SENTRY_DSN=$(sops --decrypt --extract '["SERVER_SENTRY_DSN"]' .infra/env.global.yml)
SENTRY_AUTH_TOKEN=$(sops --decrypt --extract '["SENTRY_AUTH_TOKEN"]' .infra/env.global.yml)

docker run \
  --platform=linux/amd64 \
  --rm \
  -i \
  --entrypoint /bin/bash \
  -e SENTRY_AUTH_TOKEN="${SENTRY_AUTH_TOKEN}" \
  -e SENTRY_DSN="${SENTRY_DSN}" \
  ghcr.io/mission-apprentissage/mna_${PRODUCT_NAME}_server:${VERSION} \
  /app/server/sentry-release-server.sh "mission-apprentissage/${REPO_NAME}" "${COMMIT_ID}" "${PREV_COMMIT_ID}"
