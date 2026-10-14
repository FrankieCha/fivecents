import { chmod, writeFile } from "node:fs/promises";
import readline from "node:readline";
import pg from "pg";

const lineReader = readline.createInterface({ input: process.stdin, terminal: false });
const [line] = await new Promise((resolve) => {
  const lines = [];
  lineReader.on("line", (value) => lines.push(value));
  lineReader.on("close", () => resolve(lines));
});

if (!line) throw new Error("Expected database configuration on stdin");
const config = JSON.parse(line);
for (const key of ["host", "port", "database", "user", "password"]) {
  if (!config[key]) throw new Error(`Missing database setting: ${key}`);
}

const { Pool } = pg;
const pool = new Pool({
  host: config.host,
  port: Number(config.port),
  database: config.database,
  user: config.user,
  password: config.password,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15_000,
});

try {
  const identity = await pool.query("select current_database() as database, current_user as user");
  const tables = await pool.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `);

  const username = encodeURIComponent(config.user);
  const password = encodeURIComponent(config.password);
  const databaseUrl = `postgresql://${username}:${password}@${config.host}:${config.port}/${config.database}?sslmode=require`;
  const envFile = [
    `DATABASE_URL=${databaseUrl}`,
    "SESSION_SECRET=replace-with-at-least-32-random-characters",
    "APP_URL=http://localhost:3000",
    "AZURE_STORAGE_CONNECTION_STRING=",
    "AZURE_STORAGE_CONTAINER=evidence",
    "SMTP_HOST=",
    "SMTP_PORT=587",
    "SMTP_USER=",
    "SMTP_PASSWORD=",
    "SMTP_FROM=FiveCents <no-reply@example.edu>",
    "",
  ].join("\n");

  await writeFile(".env.local", envFile, { mode: 0o600 });
  await chmod(".env.local", 0o600);
  console.log(JSON.stringify({
    connected: true,
    database: identity.rows[0].database,
    user: identity.rows[0].user,
    publicTables: tables.rows.map((row) => row.table_name),
    envConfigured: true,
  }));
} finally {
  await pool.end();
}
