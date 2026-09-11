import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * The connection string is read lazily on purpose: this module runs during
 * `next build` and inside the root layout, so throwing here would take the
 * whole app (including the admin login) down whenever DATABASE_URL is absent.
 * Instead the app boots, and the first real query reports the problem.
 */
const connectionString = process.env.DATABASE_URL?.trim();

export const isDatabaseConfigured = Boolean(connectionString);

export const DATABASE_URL_MISSING_MESSAGE =
  "DATABASE_URL is not set. Add it to .env.local (see .env.example) and restart the dev server.";

/**
 * IMPORTANT — On Vercel the DATABASE_URL may not be available during
 * `next build`.  We create the Pool lazily (on first use) so the
 * build never crashes due to a missing or unreachable database.
 */
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export function getPool(): Pool {
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool(
      connectionString ? { connectionString } : {},
    );
  }
  return globalForDb.__arenaNextJsPostgresqlPool;
}

/**
 * Lazy export — property access delegates to the real pool so drizzle-orm
 * works transparently without a module-load connection attempt.
 */
export const pool = new Proxy({} as Pool, {
  get(_target, prop, _receiver) {
    return Reflect.get(getPool(), prop, _receiver);
  },
});

export const db = drizzle(pool);
