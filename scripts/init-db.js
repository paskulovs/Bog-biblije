const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const connectionString =
  process.env.NEON_DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.NEON_POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.NEON_POSTGRES_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  console.error(
    "Missing database connection string. Set DATABASE_URL, NEON_DATABASE_URL, POSTGRES_URL, or NEON_POSTGRES_URL before running this command.",
  );
  process.exit(1);
}

const shouldUseSsl = !/(localhost|127\.0\.0\.1)/i.test(connectionString);
const initSqlPath = path.join(process.cwd(), "database", "init.sql");

const main = async () => {
  const pool = new Pool({
    connectionString,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const initSql = fs.readFileSync(initSqlPath, "utf8");
    await pool.query(initSql);
    console.log("Database schema initialized.");
  } finally {
    await pool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
