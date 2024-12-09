#!/usr/bin/env bash
set -euo pipefail

echo "Setup local environnement"

yarn
yarn services:start
yarn setup:mongodb
yarn build:dev
yarn cli migrations:up
yarn cli indexes:recreate
