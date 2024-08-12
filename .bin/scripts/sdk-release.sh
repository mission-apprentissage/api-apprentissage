#!/bin/bash
set -euo pipefail

export VERSION=${1:?"Veuillez préciser la version"}
shift 1

# Removes the "sdk@" prefix from the version if it exists (generated from git tag)
VERSION=$(echo $VERSION | sed 's/sdk@//')

# Verify if the VERSION follows the semantic versioning including pre-release
if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-(alpha|beta|rc)\.[0-9]+)?$ ]]; then
  echo "La version doit suivre le format semantique (MAJOR.MINOR.PATCH[-PRERELEASE])"
  exit 1
fi

CHANNEL="latest"

# Verify if the VERSION is a pre-release
if [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-(alpha|beta|rc)\.[0-9]+)$ ]]; then
  # get channel from pre-release
  CHANNEL=$(echo $VERSION | cut -d. -f3 | cut -d- -f2)
fi

# Add --provenance flag when ran from CI
if [[ -n "${CI:-}" ]]; then
  export NPM_CONFIG_PROVENANCE=1
fi

echo publihing "$VERSION" to "$CHANNEL"

npm version $VERSION --no-git-tag-version --workspace=sdk --no-workspaces-update
(cd "$ROOT_DIR/sdk" && npm publish --access public --tag $CHANNEL)
