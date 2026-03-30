import { Pool } from "pg";

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

const shouldUseSsl = Boolean(
  connectionString && !/(localhost|127\.0\.0\.1)/i.test(connectionString),
);

declare global {
  // eslint-disable-next-line no-var
  var bogBiblijeDbPool: Pool | undefined;
}

export const isDatabaseConfigured = Boolean(connectionString);

export const getDatabasePool = () => {
  if (!connectionString) {
    return null;
  }

  if (!globalThis.bogBiblijeDbPool) {
    globalThis.bogBiblijeDbPool = new Pool({
      connectionString,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
    });
  }

  return globalThis.bogBiblijeDbPool;
};
