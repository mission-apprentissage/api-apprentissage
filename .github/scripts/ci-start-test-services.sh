#!/usr/bin/env bash
# Démarre mongodb (replica set) pour le job de tests et écrit son code de sortie dans le fichier
# passé en argument : le workflow le lance en tâche de fond et attend ce fichier.
set -euo pipefail

done_file="${1:-/tmp/services.exit}"
trap 'echo $? > "$done_file"' EXIT

docker compose up --build -d --wait mongodb
# Même commande que `yarn setup:mongodb`, sans TTY ni dépendance à l'install en cours.
docker compose exec -T mongodb mongosh --eval "try { rs.status().ok } catch (e) { if (e.code === 94) {rs.initiate();} else {throw e} }" --quiet
