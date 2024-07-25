#!/bin/bash
set -euo pipefail

commit_id=${1:?"Veuillez préciser la version à build"}
shift 1

# Get the short version of COMMIT ID
export VERSION=${COMMIT_ID::7}

mode=${1:?"Veuillez préciser le mode <push|load>"}
shift 1

environement=${1:?"Veuillez spécifier l'environnement à build (production, recette, preview, local)"}
shift 1

set +e
docker buildx create --name "mna-${PRODUCT_NAME}" --driver docker-container --config "$SCRIPT_DIR/buildkitd.toml" 2> /dev/null
set -e

if [[ ! -z "${CI:-}" ]]; then
  export DEPS_ID=($(md5sum $ROOT_DIR/yarn.lock))
else
  export DEPS_ID=""
fi

if [ "$environement" == "production" ]; then
  export CHANNEL="latest"
else
  export CHANNEL=$environement
fi

# "$@" is the list of environements
docker buildx bake --builder "mna-${PRODUCT_NAME}" --file "$ROOT_DIR/docker-bake.json" --${mode} "$environement"
docker builder prune --builder "mna-${PRODUCT_NAME}" --keep-storage 20GB --force
docker buildx stop --builder "mna-${PRODUCT_NAME}"
