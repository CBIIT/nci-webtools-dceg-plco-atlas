#!/usr/bin/env bash
# Stand up the local GWAS Explorer backend so the data-backed pages work:
#   - MySQL + Redis in Docker (local/docker-compose.yml)
#   - phenotype tree seeded from database/import/phenotype.csv
#   - the Fastify API run with host Node (Node 22 recommended)
#
#   ./local/backend.sh          # start datastores, seed, run the API (foreground)
#   ./local/backend.sh down     # stop the datastore containers (keep data)
#   ./local/backend.sh reset    # stop and delete the MySQL volume
#
# Requires Docker Desktop running. The API streams logs in the foreground;
# Ctrl-C stops it (the containers keep running -- use `down` to stop them).
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"

COMPOSE="docker compose -f docker-compose.yml"
DB="$COMPOSE exec -T db mysql -uroot -pplcolocal"

case "${1:-up}" in
  down)  $COMPOSE down; exit 0 ;;
  reset) $COMPOSE down -v; exit 0 ;;
esac

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon is not running. Start Docker Desktop and retry." >&2
  exit 1
fi

echo "==> generating phenotype seed from database/import/phenotype.csv"
python3 gen-seed.py

echo "==> starting MySQL + Redis"
$COMPOSE up -d

echo "==> waiting for MySQL to be healthy"
until [ "$(docker inspect -f '{{.State.Health.Status}}' plco-local-db-1 2>/dev/null)" = "healthy" ]; do
  sleep 2
done

echo "==> applying schema + seed"
$DB < db-init/01-schema.sql
$DB plcogwas < db-init/02-seed-phenotype.sql
echo "    phenotype rows: $($DB -N -e 'SELECT COUNT(*) FROM plcogwas.phenotype;')"

echo "==> installing server dependencies (first run only)"
[ -d "$ROOT/server/node_modules" ] || ( cd "$ROOT/server" && npm install )

echo "==> starting Fastify API on http://localhost:9000 (Ctrl-C to stop)"
echo "    then run the client in another terminal:  (cd client && npm start)"
echo "    and open http://localhost:3000/#/phenotypes"
# shellcheck disable=SC1091
source ./backend.env
cd "$ROOT/server"
exec node server.js
