import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * One-time DB setup endpoint.
 * Creates roles, database, schemas, grants, and runs migrations.
 * Uses the pg module to connect directly (no psql needed).
 */
export async function GET() {
  const adminUrl = process.env.PG_ADMIN_URL;
  const migrationUrl = process.env.MIGRATION_DATABASE_URL;

  if (!adminUrl) {
    return NextResponse.json({ error: "PG_ADMIN_URL not set" }, { status: 500 });
  }

  const results: string[] = [];

  try {
    // Dynamic import of pg
    const { Client } = await import("pg");

    // Connect as admin
    const adminClient = new Client({ connectionString: adminUrl, connectionTimeoutMillis: 10000 });
    await adminClient.connect();
    results.push("✓ Admin connection established");

    // Create roles
    try {
      await adminClient.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entix_app_core_app') THEN
            CREATE ROLE entix_app_core_app LOGIN PASSWORD 'EntixApp2026Run!';
          END IF;
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entix_app_core_migrator') THEN
            CREATE ROLE entix_app_core_migrator LOGIN PASSWORD 'EntixMig2026Run!';
          END IF;
        END $$;
      `);
      results.push("✓ Roles created");
    } catch (e) {
      results.push(`✗ Roles: ${e instanceof Error ? e.message.slice(0, 200) : "failed"}`);
    }

    // Create database
    try {
      await adminClient.query(`SELECT 'CREATE DATABASE entix_app_core' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'entix_app_core')`);
      const res = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = 'entix_app_core'");
      if (res.rows.length === 0) {
        await adminClient.query("CREATE DATABASE entix_app_core");
      }
      results.push("✓ Database created");
    } catch (e) {
      results.push(`✗ Database: ${e instanceof Error ? e.message.slice(0, 200) : "failed"}`);
    }

    await adminClient.end();

    // Connect to entix_app_core to create schemas + grants
    const appDbUrl = adminUrl.replace(/\/postgres$/, "/entix_app_core");
    const appClient = new Client({ connectionString: appDbUrl, connectionTimeoutMillis: 10000 });
    await appClient.connect();

    try {
      await appClient.query(`
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
        
        ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit GRANT ALL PRIVILEGES ON TABLES TO entix_app_core_migrator;
        ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit GRANT ALL PRIVILEGES ON SEQUENCES TO entix_app_core_migrator;
        ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO entix_app_core_app;
        ALTER DEFAULT PRIVILEGES IN SCHEMA auth, app, content, automation, audit GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO entix_app_core_app;
      `);
      results.push("✓ Schemas + grants set");
    } catch (e) {
      results.push(`✗ Schemas: ${e instanceof Error ? e.message.slice(0, 200) : "failed"}`);
    }

    await appClient.end();

    // Run migrations using prisma
    if (migrationUrl) {
      try {
        const { execSync } = await import("node:child_process");
        const output = execSync("npx prisma migrate deploy", {
          timeout: 60000,
          env: { ...process.env, DATABASE_URL: migrationUrl },
          stdio: "pipe"
        }).toString();
        results.push(`✓ Migrations: ${output.slice(0, 300)}`);
      } catch (e) {
        const err = e as { stderr?: Buffer; message?: string };
        const msg = err.stderr?.toString().slice(0, 300) || err.message?.slice(0, 300) || "failed";
        results.push(`✗ Migrations: ${msg}`);
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      results
    }, { status: 500 });
  }
}
