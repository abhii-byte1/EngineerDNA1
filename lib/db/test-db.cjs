const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgres://postgres:postgres@localhost:5432/postgres",
  });

  try {
    await client.connect();
    console.log("Successfully connected to 'postgres' database.");
    
    // Check if engineer_dna exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'engineer_dna'");
    if (res.rows.length === 0) {
      console.log("Database 'engineer_dna' does not exist. Creating it...");
      await client.query("CREATE DATABASE engineer_dna");
      console.log("Database 'engineer_dna' created successfully.");
    } else {
      console.log("Database 'engineer_dna' already exists.");
    }
  } catch (err) {
    console.error("Database connection error:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();
