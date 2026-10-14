import crypto from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import pg from "pg";

process.loadEnvFile(".env.local");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");

const envPath = ".env.local";
const currentEnv = await readFile(envPath, "utf8");
if (currentEnv.includes("SESSION_SECRET=replace-with-at-least-32-random-characters")) {
  const sessionSecret = crypto.randomBytes(48).toString("base64url");
  await writeFile(
    envPath,
    currentEnv.replace(
      "SESSION_SECRET=replace-with-at-least-32-random-characters",
      `SESSION_SECRET=${sessionSecret}`,
    ),
    { mode: 0o600 },
  );
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15_000,
});

const client = await pool.connect();
try {
  const existing = await client.query(`
    select count(*)::integer as count
    from information_schema.tables
    where table_schema = 'public'
  `);
  if (existing.rows[0].count !== 0) {
    throw new Error("Schema application stopped because the public schema is not empty");
  }

  const schema = await readFile("database/schema.sql", "utf8");
  const seed = await readFile("database/seed.sql", "utf8");
  await client.query("begin");
  await client.query(schema);
  await client.query(seed);
  await client.query("commit");

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `);
  const academicYears = await client.query(`
    select code, minimum_cents, maximum_cents, is_current, is_permanently_locked
    from academic_years
    order by code
  `);
  console.log(JSON.stringify({
    schemaApplied: true,
    tables: tables.rows.map((row) => row.table_name),
    academicYears: academicYears.rows,
    sessionSecretGenerated: true,
  }));
} catch (error) {
  await client.query("rollback").catch(() => {});
  throw error;
} finally {
  client.release();
  await pool.end();
}
