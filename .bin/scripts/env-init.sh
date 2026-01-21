#!/usr/bin/env bash

set -euo pipefail

echo "Updating local server/.env & ui/.env"

ansible-galaxy collection install -U community.sops

ANSIBLE_CONFIG="${ROOT_DIR}/.infra/ansible/ansible.cfg" ansible-playbook \
  --limit "local" \
  "${ROOT_DIR}/.infra/ansible/initialize-env.yml"

echo "PUBLIC_VERSION=0-local" >> "${ROOT_DIR}/server/.env"
echo "PUBLIC_PRODUCT_NAME=\"${PRODUCT_NAME}\"" >> "${ROOT_DIR}/server/.env"

echo "NEXT_PUBLIC_ENV=local" >> "${ROOT_DIR}/ui/.env"
echo "NEXT_PUBLIC_VERSION=0-local" >> "${ROOT_DIR}/ui/.env"
echo "NEXT_PUBLIC_PRODUCT_NAME=\"${PRODUCT_NAME}\"" >> "${ROOT_DIR}/ui/.env"
echo "NEXT_PUBLIC_PRODUCT_REPO=\"${REPO_NAME}\"" >> "${ROOT_DIR}/ui/.env"
echo "NEXT_PUBLIC_API_PORT=5002" >> "${ROOT_DIR}/ui/.env"

yarn
yarn services:start
yarn setup:mongodb
yarn build:dev
yarn cli migrations:up
yarn cli indexes:recreate

