import { initializeDatabase } from "./src/lib/db.ts";

async function main() {
  console.log("Starting manual database initialization...");
  try {
    await initializeDatabase();
    console.log("Database initialization finished.");
  } catch (err) {
    console.error("Initialization failed:", err);
  }
}

main();
