import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

async function checkTable() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const client = createClient({ url, authToken });

  try {
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='pricing_plans'");
    console.log("Table 'pricing_plans' check:", result.rows);
    
    if (result.rows.length > 0) {
      const columns = await client.execute("PRAGMA table_info(pricing_plans)");
      console.log("Columns:", columns.rows);
    }
  } catch (err) {
    console.error("Check failed:", err);
  }
}

checkTable();
