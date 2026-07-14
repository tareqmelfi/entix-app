#!/bin/sh
# entrypoint.sh — set up DB roles, run migrations, then start app.
# Requires: MIGRATION_DATABASE_URL (migrator role), DATABASE_URL (app role)
# The Postgres admin URL is used only for initial role/database setup.

set -e

# ── 1. Initial DB setup (roles + database) — only on first run ──
# Uses PG_ADMIN_URL if provided (the Coolify postgres admin connection)
if [ -n "$PG_ADMIN_URL" ]; then
  echo "▶ Checking/creating roles and logical database…"

  # Create roles if they don't exist
  psql "$PG_ADMIN_URL" -v ON_ERROR_STOP=0 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entix_app_core_app') THEN
    CREATE ROLE entix_app_core_app LOGIN PASSWORD 'EntixApp2026Run!';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entix_app_core_migrator') THEN
    CREATE ROLE entix_app_core_migrator LOGIN PASSWORD 'EntixMig2026Run!';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entix_app_core_n8n') THEN
    CREATE ROLE entix_app_core_n8n LOGIN PASSWORD 'EntixN8n2026Run!';
  END IF;
END
$$;

-- Create logical database if it doesn't exist
SELECT 'CREATE DATABASE entix_app_core'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'entix_app_core')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE entix_app_core TO entix_app_core_migrator;
GRANT CONNECT ON DATABASE entix_app_core TO entix_app_core_app;
GRANT CONNECT ON DATABASE entix_app_core TO entix_app_core_n8n;
SQL

  # Create schemas and grants inside entix_app_core
  psql "${PG_ADMIN_URL%/postgres}/entix_app_core" -v ON_ERROR_STOP=0 <<'SQL'
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS automation;
CREATE SCHEMA IF NOT EXISTS audit;

GRANT USAGE, CREATE ON SCHEMA auth, app, content, automation, audit TO entix_app_core_migrator;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_migrator;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_migrator;

GRANT USAGE ON SCHEMA auth, app, content, automation, audit TO entix_app_core_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_app;

GRANT USAGE ON SCHEMA app, content, automation, audit TO entix_app_core_n8n;
GRANT SELECT ON ALL TABLES IN SCHEMA app, content, automation, audit TO entix_app_core_n8n;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit
  GRANT ALL PRIVILEGES ON TABLES TO entix_app_core_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit
  GRANT ALL PRIVILEGES ON SEQUENCES TO entix_app_core_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO entix_app_core_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO entix_app_core_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA app, content, automation, audit
  GRANT SELECT ON TABLES TO entix_app_core_n8n;
SQL

  echo "✓ DB roles and schemas ready."
fi

# ── 2. Run migrations (migrator role) ──
if [ -n "$MIGRATION_DATABASE_URL" ]; then
  echo "▶ Running prisma migrate deploy (migrator role)…"
  DATABASE_URL="$MIGRATION_DATABASE_URL" node ./node_modules/prisma/build/index.js migrate deploy || {
    echo "⚠ Migration step failed. Continuing with app startup."
  }
else
  echo "ℹ MIGRATION_DATABASE_URL not set — skipping migrations."
fi

# ── 3. Start the application ──
echo "▶ Starting Entix.app…"
exec node server.js
