#!/bin/bash
set -euo pipefail

export ENVIRONMENT="${1:?"Veuillez préciser l'environement"}";
shift;

if [[ -z "${ANSIBLE_VAULT_PASSWORD_FILE:-}" ]]; then
  ansible_extra_opts+=("--vault-password-file" "${SCRIPT_DIR}/get-vault-password-client.sh")
else
  echo "Récupération de la passphrase depuis l'environnement variable ANSIBLE_VAULT_PASSWORD_FILE" 
fi

readonly VAULT_FILE="${ROOT_DIR}/.infra/vault/vault.yml"

SENTRY_DSN=$(ansible-vault view "${ansible_extra_opts[@]}" "$VAULT_FILE" | yq -r '.vault.SERVER_SENTRY_DSN')
SENTRY_AUTH_TOKEN=$(ansible-vault view "${ansible_extra_opts[@]}" "$VAULT_FILE" | yq -r '.vault.SENTRY_AUTH_TOKEN')

VERSION=$(git rev-parse --short HEAD)

docker run \
  --platform=linux/amd64 \
  --rm \
  -i \
  --entrypoint /bin/bash \
  -e SENTRY_AUTH_TOKEN="${SENTRY_AUTH_TOKEN}" \
  -e SENTRY_DSN="${SENTRY_DSN}" \
  ghcr.io/mission-apprentissage/mna_${PRODUCT_NAME}_server:${VERSION} \
  /app/server/sentry-deploy-server.sh "${ENVIRONMENT}" 
