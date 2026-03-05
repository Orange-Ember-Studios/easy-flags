import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";

/**
 * Migration interface
 */
export interface Migration {
  up(db: Database<sqlite3.Database>): Promise<void>;
  down(db: Database<sqlite3.Database>): Promise<void>;
}

/**
 * Run all pending migrations
 * @param db - The database instance
 * @param migrationsDir - Directory containing migration files
 */
export async function runMigrations(
  db: Database<sqlite3.Database>,
  migrationsDir: string,
): Promise<void> {
  // Create migrations table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get all migration files (from compiled .js files)
  const files = fs
    .readdirSync(migrationsDir)
    .filter(
      (file) =>
        file.endsWith(".js") && file !== "runner.js" && file !== "index.js",
    )
    .sort();

  // Get applied migrations
  const applied = await db.all<Array<{ name: string }>>(
    "SELECT name FROM migrations",
  );
  const appliedNames = new Set(applied.map((row) => row.name));

  // Show migration status
  if (files.length === 0) {
    console.log("📦 No migrations found");
    return;
  }

  const pendingCount = files.filter(
    (file) => !appliedNames.has(path.basename(file, path.extname(file))),
  ).length;

  if (pendingCount === 0) {
    console.log(
      `📦 Database up-to-date (${appliedNames.size} migrations applied)`,
    );
    return;
  }

  console.log(`📦 Running ${pendingCount} pending migration(s)...`);

  // Run pending migrations
  for (const file of files) {
    const migrationName = path.basename(file, path.extname(file));

    if (appliedNames.has(migrationName)) {
      continue;
    }

    try {
      // Dynamically import the migration
      const migrationModule = await import(
        path.join(migrationsDir, migrationName)
      );
      const migration = migrationModule.default as Migration;

      process.stdout.write(`  → ${migrationName} ... `);
      await migration.up(db);

      // Record the migration as applied
      await db.run("INSERT INTO migrations (name) VALUES (?)", migrationName);

      console.log("✓");
    } catch (error) {
      console.log("✗");
      console.error(`\n✗ Migration failed: ${migrationName}`, error);
      throw error;
    }
  }

  console.log(`✓ All migrations applied successfully!`);
}

/**
 * Rollback the last migration
 * @param db - The database instance
 * @param migrationsDir - Directory containing migration files
 */
export async function rollbackMigration(
  db: Database<sqlite3.Database>,
  migrationsDir: string,
): Promise<void> {
  // Get the last applied migration
  const lastMigration = await db.get<{ name: string }>(
    "SELECT name FROM migrations ORDER BY id DESC LIMIT 1",
  );

  if (!lastMigration) {
    console.log("No migrations to rollback");
    return;
  }

  try {
    const migrationModule = await import(
      path.join(migrationsDir, lastMigration.name)
    );
    const migration = migrationModule.default as Migration;

    console.log(`→ Rolling back migration: ${lastMigration.name}`);
    await migration.down(db);

    // Remove the migration record
    await db.run("DELETE FROM migrations WHERE name = ?", lastMigration.name);

    console.log(`✓ Rollback completed: ${lastMigration.name}`);
  } catch (error) {
    console.error(
      `✗ Rollback failed for migration: ${lastMigration.name}`,
      error,
    );
    throw error;
  }
}

/**
 * Get the status of all migrations
 * @param db - The database instance
 * @param migrationsDir - Directory containing migration files
 */
export async function getMigrationStatus(
  db: Database<sqlite3.Database>,
  migrationsDir: string,
): Promise<{ name: string; applied: boolean }[]> {
  const files = fs
    .readdirSync(migrationsDir)
    .filter(
      (file) =>
        file.endsWith(".ts") && file !== "runner.ts" && file !== "index.ts",
    )
    .sort();

  const applied = await db.all<Array<{ name: string }>>(
    "SELECT name FROM migrations",
  );
  const appliedNames = new Set(applied.map((row) => row.name));

  return files.map((file) => ({
    name: path.basename(file, path.extname(file)),
    applied: appliedNames.has(path.basename(file, path.extname(file))),
  }));
}
