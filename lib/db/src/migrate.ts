import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index";
import path from "path";
import fileURLToPath from "url";

export async function runMigrations() {
  try {
    const migrationsFolder = path.resolve(process.cwd(), "lib/db/drizzle");
    console.log("[db] Running migrations from:", migrationsFolder);
    await migrate(db, { migrationsFolder });
    console.log("[db] Migrations completed successfully.");
  } catch (err) {
    console.error("[db] Migration error:", err);
  }
}
