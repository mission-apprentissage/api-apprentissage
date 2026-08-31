#!/usr/bin/env bash
set -euo pipefail

/opt/app/scripts/docker-compose.sh run --rm --no-deps server node dist/index.js migrations:status
