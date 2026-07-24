import pg from "pg";
import fs from "fs";
import path from "path";

// Read root .env
const rootEnvPath = path.resolve(process.cwd(), "../../.env");
const localEnvPath = path.resolve(process.cwd(), ".env");
const envPath = fs.existsSync(localEnvPath) ? localEnvPath : rootEnvPath;

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || "";
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val.trim();
    }
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not found!");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });

async function run() {
  console.log("[migrate] Connecting to Neon database...");
  await client.connect();
  console.log("[migrate] Connected successfully.");

  const migrationFiles = [
    "./drizzle/0001_drop_legacy_tables.sql",
    "./drizzle/0002_enhance_github_reports.sql",
    "./drizzle/0003_interview_sessions_and_email.sql",
    "./drizzle/0004_admin_and_feedback.sql",
  ];

  for (const relFile of migrationFiles) {
    const filePath = path.resolve(process.cwd(), relFile);
    if (fs.existsSync(filePath)) {
      console.log(`[migrate] Executing ${relFile}...`);
      const sql = fs.readFileSync(filePath, "utf-8");
      await client.query(sql);
      console.log(`[migrate] Completed ${relFile}`);
    } else {
      console.warn(`[migrate] File not found: ${filePath}`);
    }
  }

  await client.end();
  console.log("[migrate] All migrations applied to database!");
}

run().catch((err) => {
  console.error("[migrate] Migration error:", err);
  process.exit(1);
});
