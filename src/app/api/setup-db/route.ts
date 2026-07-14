import { NextResponse } from "next/server";
import { execSync } from "node:child_process";

export const dynamic = "force-dynamic";

/**
 * One-time DB setup endpoint.
 * Creates roles, database, schemas, grants, and runs migrations.
 * DELETE this file after first successful run.
 */
export async function GET() {
  const adminUrl = process.env.PG_ADMIN_URL;
  const migrationUrl = process.env.MIGRATION_DATABASE_URL;

  if (!adminUrl) {
    return NextResponse.json({ error: "PG_ADMIN_URL not set" }, { status: 500 });
  }

  const results: string[] = [];

  // Step 1: Create roles
  try {
    execSync(
      `psql "${adminUrl}" -v ON_ERROR_STOP=0 -c "DO \\\$\\\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entix_app_core_app') THEN CREATE ROLE entix_app_core_app LOGIN PASSWORD 'EntixApp2026Run!'; END IF; IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entix_app_core_migrator') THEN CREATE ROLE entix_app_core_migrator LOGIN PASSWORD 'EntixMig2026Run!'; END IF; END \\\$\\\$;"`,
      { timeout: 10000, stdio: "pipe" }
    );
    results.push("✓ Roles created");
  } catch (e) {
    results.push(`✗ Roles: ${e instanceof Error ? e.message.slice(0, 200) : "failed"}`);
  }

  // Step 2: Create database
  try {
    execSync(
      `psql "${adminUrl}" -v ON_ERROR_STOP=0 -c "SELECT 'CREATE DATABASE entix_app_core' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'entix_app_core')\\gexec"`,
      { timeout: 10000, stdio: "pipe" }
    );
    results.push("✓ Database created");
  } catch (e) {
    results.push(`✗ Database: ${e instanceof Error ? e.message.slice(0, 200) : "failed"}`);
  }

  // Step 3: Create schemas + grants in entix_app_core
  const appDbUrl = adminUrl.replace(/\/postgres$/, "/entix_app_core");
  try {
    execSync(
      `psql "${appDbUrl}" -v ON_ERROR_STOP=0 -c "CREATE SCHEMA IF NOT EXISTS auth; CREATE SCHEMA IF NOT EXISTS app; CREATE SCHEMA IF NOT EXISTS content; CREATE SCHEMA IF NOT EXISTS automation; CREATE SCHEMA IF NOT EXISTS audit; GRANT USAGE, CREATE ON SCHEMA auth, app, content, automation, audit TO entix_app_core_migrator; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_migrator; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_migrator; GRANT USAGE ON SCHEMA auth, app, content, automation, audit TO entix_app_core_app; GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_app; GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA auth, app, content, automation, audit TO entix_app_core_app; ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit GRANT ALL PRIVILEGES ON TABLES TO entix_app_core_migrator; ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit GRANT ALL PRIVILEGES ON SEQUENCES TO entix_app_core_migrator; ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO entix_app_core_app; ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO entix_app_core_app;"`,
      { timeout: 10000, stdio: "pipe" }
    );
    results.push("✓ Schemas + grants set");
  } catch (e) {
    results.push(`✗ Schemas: ${e instanceof Error ? e.message.slice(0, 200) : "failed"}`);
  }

  // Step 4: Run migrations
  if (migrationUrl) {
    try {
      const output = execSync(
        `node ./node_modules/prisma/build/index.js migrate deploy`,
        { timeout: 60000, stdio: "pipe", env: { ...process.env, DATABASE_URL: migrationUrl } }
      ).toString();
      results.push(`✓ Migrations: ${output.slice(0, 300)}`);
    } catch (e) {
      results.push(`✗ Migrations: ${e instanceof Error ? (e as Error).message.slice(0, 300) : "failed"}`);
    }
  } else {
    results.push("⚠ MIGRATION_DATABASE_URL not set — skipping migrations");
  }

  return NextResponse.json({ results });
}
