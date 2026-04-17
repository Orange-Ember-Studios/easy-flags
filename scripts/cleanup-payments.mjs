import { createClient } from "@libsql/client";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const dbUrl = process.env.DATABASE_URL || "file:./data.db";
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

async function main() {
  const client = createClient({
    url: dbUrl,
    ...(dbAuthToken && { authToken: dbAuthToken }),
  });

  try {
    console.log("Cleaning payments table...");
    await client.execute("DELETE FROM payments;");
    console.log("Verifying table is empty...");
    const result = await client.execute("SELECT COUNT(*) as count FROM payments;");
    console.log(`Table cleaned. Current count: ${result.rows[0].count}`);
  } catch (error) {
    console.error("Error cleaning payments table:", error);
    process.exit(1);
  }
}

main();
