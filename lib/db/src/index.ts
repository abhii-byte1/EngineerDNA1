import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isSslRequired =
  process.env.DATABASE_URL.includes("sslmode=") ||
  process.env.DATABASE_URL.includes("neon.tech");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
  max: 20, // Limit maximum concurrent connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
export * from "./queries/percentile";

