#!/bin/sh
# entrypoint.sh — run migrations (migrator role) then start app (app role).
# Requires MIGRATION_DATABASE_URL and DATABASE_URL set by Coolify.
set -e

if [ -n "$MIGRATION_DATABASE_URL" ]; then
  echo "▶ Running prisma migrate deploy (migrator role)…"
  DATABASE_URL="$MIGRATION_DATABASE_URL" node ./node_modules/prisma/build/index.js migrate deploy || {
    echo "⚠ Migration step failed. Continuing with app startup."
  }
else
  echo "ℹ MIGRATION_DATABASE_URL not set — skipping migrations."
fi

echo "▶ Starting Entix.app…"
exec node server.js
