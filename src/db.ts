import path from "path";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { runMigrations } from "./migrations/runner";

const dbFile = path.resolve(process.cwd(), "data.db");

let dbInstance: Database<sqlite3.Database> | null = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  // Open database connection
  dbInstance = await open({ filename: dbFile, driver: sqlite3.Database });

  // Enable WAL mode for better concurrency
  await dbInstance.exec("PRAGMA journal_mode = WAL");

  // Run pending migrations
  const migrationsDir = path.join(__dirname, "migrations");
  await runMigrations(dbInstance, migrationsDir);

  return dbInstance;
}

export default getDb;
