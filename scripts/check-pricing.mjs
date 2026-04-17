
import { createClient } from "@libsql/client";
import { config } from "dotenv";

config();

const dbUrl = process.env.DATABASE_URL || "file:./data.db";
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

async function checkPricing() {
  const client = createClient({
    url: dbUrl,
    ...(dbAuthToken && { authToken: dbAuthToken }),
  });

  const result = await client.execute("SELECT * FROM pricing_plans");
  console.log(JSON.stringify(result.rows, null, 2));
}

checkPricing();
