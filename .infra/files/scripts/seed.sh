#!/usr/bin/env bash

set -euo pipefail

readonly TARGET_DB=${1:?"Merci de préciser le nom de la base de donnée cible"}
shift
readonly SEED_ARCHIVE=$(mktemp seed_archive.XXXXXXXXXX)
readonly PASSPHRASE=$(mktemp passphrase.XXXXXXXXXX)

delete_cleartext() {
  if [ -f "$SEED_ARCHIVE" ]; then
    shred -f -n 10 -u "$SEED_ARCHIVE"
  fi

  if [ -f "$PASSPHRASE" ]; then
    shred -f -n 10 -u "$PASSPHRASE"
  fi
}

trap delete_cleartext EXIT

echo "{{ vault.SEED_GPG_PASSPHRASE }}" > "$PASSPHRASE"

chmod 600 "$PASSPHRASE"

rm -r "$SEED_ARCHIVE"
gpg -d --batch --passphrase-file "$PASSPHRASE" -o "$SEED_ARCHIVE" "/opt/app/configs/mongodb/seed.gpg"
chmod 600 "$SEED_ARCHIVE"
cat "$SEED_ARCHIVE" | docker compose -f "/opt/app/docker-compose.preview-system.yml" exec -iT mongodb mongorestore --archive --nsFrom="{{database_name}}.*" --nsTo="$TARGET_DB.*" --drop --numInsertionWorkersPerCollection=2 -j=2 --gzip "mongodb://__system:{{vault.MONGODB_KEYFILE}}@localhost:27017/?authSource=local&directConnection=true"
