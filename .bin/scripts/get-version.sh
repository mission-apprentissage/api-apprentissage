#!/usr/bin/env bash

# If REQUEST_VERSION is set, and different from latest tag, use it
if [[ -n "${REQUEST_VERSION:-}" ]]; then
  if [[ "${REQUEST_VERSION}" != "latest" ]]; then
    echo "${REQUEST_VERSION}"
    exit 0
  fi
fi

VERSION=$(git describe --tags --abbrev=0 --candidates 100 --always)
HEAD=$(git rev-parse HEAD)

if [[ "$VERSION" = "$HEAD" ]]; then
  VERSION="v0.0.0"
fi;

set -euo pipefail

echo "${VERSION:1}"
