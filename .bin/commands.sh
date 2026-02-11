#!/usr/bin/env bash

set -euo pipefail

if [ ! -f "${ROOT_DIR}/.bin/shared/commands.sh" ]; then

  echo "Mise à jour du sous-module mna-shared-bin"

  git submodule update --init "${ROOT_DIR}/.bin/shared"

fi

. "${ROOT_DIR}/.bin/shared/commands.sh"

################################################################################
# Non-shared commands
################################################################################

_meta_help["app:build"]="Build Ui & Server Docker images"

function app:build() {
  "${SCRIPT_DIR}/app-build.sh" "$@"
}

_meta_help["env:init"]="Update local env files using values from SOPS files"

function env:init() {
  "${SCRIPT_DIR}/env-init.sh" "$@"
}

_meta_help["sdk:release"]="Release SDK version"

function sdk:release() {
  "${SCRIPT_DIR}/sdk-release.sh" "$@"
}

_meta_help["sentry:deploy"]="Notify deployment to sentry for existing sentry release"

function sentry:deploy() {
  "${SCRIPT_DIR}/sentry-deploy.sh" "$@"
}

_meta_help["sentry:release"]="Create sentry release for existing Docker image"

function sentry:release() {
  "${SCRIPT_DIR}/sentry-release.sh" "$@"
}

