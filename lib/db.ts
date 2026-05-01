import { Pool, QueryResultRow } from "pg";

const connectionStrings = [
  process.env.NEON_DATABASE_URL,
  process.env.DATABASE_URL,
  process.env.NEON_POSTGRES_URL,
  process.env.POSTGRES_URL,
  process.env.NEON_POSTGRES_PRISMA_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.NEON_DATABASE_URL_UNPOOLED,
  process.env.DATABASE_URL_UNPOOLED,
  process.env.NEON_POSTGRES_URL_NON_POOLING,
  process.env.POSTGRES_URL_NON_POOLING,
].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);

const CONNECTION_ERROR_CODES = new Set([
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
]);

const shouldUseSsl = (connectionString: string) =>
  !/(localhost|127\.0\.0\.1)/i.test(connectionString);

const getConnectionHost = (connectionString: string) => {
  try {
    return new URL(connectionString).host;
  } catch {
    return connectionString;
  }
};

const isRetryableConnectionError = (error: unknown) => {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return CONNECTION_ERROR_CODES.has(String(error.code));
};

export const isDatabaseConnectionError = (error: unknown) =>
  isRetryableConnectionError(error);

declare global {
  // eslint-disable-next-line no-var
  var bogBiblijeDbPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var bogBiblijeDbPools: Map<string, Pool> | undefined;
  // eslint-disable-next-line no-var
  var bogBiblijeDbConnectionIndex: number | undefined;
}

export const isDatabaseConfigured = connectionStrings.length > 0;

const getConnectionOrder = () => {
  const preferredIndex = globalThis.bogBiblijeDbConnectionIndex ?? 0;
  const fallbackIndexes = connectionStrings.map((_, index) => index).filter((index) => index !== preferredIndex);

  return [preferredIndex, ...fallbackIndexes].filter((index) => connectionStrings[index]);
};

const getPoolForConnectionString = (connectionString: string) => {
  if (!globalThis.bogBiblijeDbPools) {
    globalThis.bogBiblijeDbPools = new Map<string, Pool>();
  }

  const existingPool = globalThis.bogBiblijeDbPools.get(connectionString);
  if (existingPool) {
    return existingPool;
  }

  const pool = new Pool({
    connectionString,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  });

  globalThis.bogBiblijeDbPools.set(connectionString, pool);
  globalThis.bogBiblijeDbPool = pool;

  return pool;
};

const resetPoolForConnectionString = async (connectionString: string) => {
  const pool = globalThis.bogBiblijeDbPools?.get(connectionString);
  if (!pool) {
    return;
  }

  globalThis.bogBiblijeDbPools?.delete(connectionString);

  if (globalThis.bogBiblijeDbPool === pool) {
    globalThis.bogBiblijeDbPool = undefined;
  }

  await pool.end().catch(() => undefined);
};

export const getDatabasePool = () => {
  const selectedConnectionString = connectionStrings[globalThis.bogBiblijeDbConnectionIndex ?? 0];
  if (!selectedConnectionString) {
    return null;
  }

  if (!globalThis.bogBiblijeDbPool) {
    globalThis.bogBiblijeDbPool = getPoolForConnectionString(selectedConnectionString);
  }

  return globalThis.bogBiblijeDbPool;
};

export const runDatabaseQuery = async <T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
) => {
  if (!connectionStrings.length) {
    return [] as T[];
  }

  let lastError: unknown;

  for (const connectionIndex of getConnectionOrder()) {
    const connectionString = connectionStrings[connectionIndex];

    try {
      const result = await getPoolForConnectionString(connectionString).query<T>(text, values);
      globalThis.bogBiblijeDbConnectionIndex = connectionIndex;
      globalThis.bogBiblijeDbPool = getPoolForConnectionString(connectionString);

      return result.rows;
    } catch (error) {
      lastError = error;

      if (!isRetryableConnectionError(error) || connectionStrings.length === 1) {
        throw error;
      }

      await resetPoolForConnectionString(connectionString);
      console.warn(
        `Database connection failed for ${getConnectionHost(connectionString)}. Trying next configured connection.`,
      );
    }
  }

  throw lastError;
};
