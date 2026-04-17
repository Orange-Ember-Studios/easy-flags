import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

async function testConnection() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  console.log(`Connecting to: ${url}`);
  const client = createClient({ url, authToken });

  try {
    const result = await client.execute("SELECT 1");
    console.log("Connection successful:", result.rows);
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

testConnection();
