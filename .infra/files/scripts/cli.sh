#!/usr/bin/env bash
set -euo pipefail
#Needs to be run as sudo

/opt/app/scripts/docker-compose.sh run --rm --no-deps server yarn cli "$@"
