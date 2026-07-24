import pg from "pg";
import fs from "fs";
import path from "path";

// Parse .env
const envPath = path.resolve(process.cwd(), ".env");
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
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });

async function run() {
  console.log("Connecting to PostgreSQL...");
  await client.connect();
  console.log("Connected to PostgreSQL.");

  const migrationFiles = [
    "lib/db/drizzle/0001_drop_legacy_tables.sql",
    "lib/db/drizzle/0002_enhance_github_reports.sql",
    "lib/db/drizzle/0003_interview_sessions_and_email.sql",
  ];

  for (const relFile of migrationFiles) {
    const filePath = path.resolve(process.cwd(), relFile);
    if (fs.existsSync(filePath)) {
      console.log(`Applying migration: ${relFile}...`);
      const sql = fs.readFileSync(filePath, "utf-8");
      await client.query(sql);
      console.log(`Successfully applied ${relFile}`);
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  }

  await client.end();
  console.log("All DB migrations applied successfully!");
}

run().catch((err) => {
  console.error("Migration execution failed:", err);
  process.exit(1);
});
