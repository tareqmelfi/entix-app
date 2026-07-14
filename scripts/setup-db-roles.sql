-- scripts/setup-db-roles.sql
-- Creates the roles and schemas for the entix_app_core logical database.
-- Run as the postgres admin on the Coolify Postgres resource (init or one-time).
-- Roles follow AGENTS.md locked constraints:
--   entix_app_core_app       → runtime SELECT/INSERT/UPDATE/DELETE only
--   entix_app_core_migrator  → schema DDL + full data access (migrations only)
--   entix_app_core_n8n       → read-only subset (enabled later per-workflow)

-- ── Roles ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entix_app_core_app') THEN
    CREATE ROLE entix_app_core_app LOGIN PASSWORD 'dev_app_pass';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entix_app_core_migrator') THEN
    CREATE ROLE entix_app_core_migrator LOGIN PASSWORD 'dev_migrator_pass';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entix_app_core_n8n') THEN
    CREATE ROLE entix_app_core_n8n LOGIN PASSWORD 'dev_n8n_pass';
  END IF;
END $$;

-- ── Schemas ──
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS automation;
CREATE SCHEMA IF NOT EXISTS audit;

-- ── Grants: migrator (DDL + full data) ──
GRANT USAGE, CREATE ON SCHEMA auth, app, content, automation, audit TO entix_app_core_migrator;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_migrator;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit
  GRANT ALL PRIVILEGES ON TABLES TO entix_app_core_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit
  GRANT ALL PRIVILEGES ON SEQUENCES TO entix_app_core_migrator;

-- ── Grants: app runtime (data CRUD only, no DDL) ──
GRANT USAGE ON SCHEMA auth, app, content, automation, audit TO entix_app_core_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO entix_app_core_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO entix_app_core_app;

-- ── Grants: n8n (read-only subset, enabled later) ──
GRANT USAGE ON SCHEMA app, content, automation, audit TO entix_app_core_n8n;
GRANT SELECT ON ALL TABLES IN SCHEMA app, content, automation, audit TO entix_app_core_n8n;
ALTER DEFAULT PRIVILEGES IN SCHEMA app, content, automation, audit
  GRANT SELECT ON TABLES TO entix_app_core_n8n;
