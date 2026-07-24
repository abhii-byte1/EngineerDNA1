import pg from "pg";
import fs from "fs";
import path from "path";

const localEnvPath = path.resolve(process.cwd(), ".env");
const rootEnvPath = path.resolve(process.cwd(), "../../.env");
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
  await client.connect();
  console.log("Connected to database.");

  // Promote all existing accounts or specific usernames to admin
  const res = await client.query(`UPDATE users SET role = 'admin' RETURNING id, github_username, email, role;`);
  console.log("Updated users to admin role:");
  console.log(res.rows);

  await client.end();
}

run().catch((err) => {
  console.error("Error promoting admin:", err);
  process.exit(1);
});
