import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const rows = await prisma.$queryRaw<Array<{ schema_name: string }>>`
    select schema_name
    from information_schema.schemata
    where schema_name in ('auth', 'app', 'content', 'automation', 'audit')
    order by schema_name
  `;

  console.log(
    JSON.stringify(
      {
        ok: true,
        database: "entix_app_core",
        schemas: rows.map((row) => row.schema_name)
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown database error"
      },
      null,
      2
    )
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
