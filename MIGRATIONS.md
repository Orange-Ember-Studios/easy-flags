# Database Migrations Guide

This project uses a custom migration system to manage database schema changes. Migrations are automatically applied on startup, ensuring your database is always up-to-date.

## How It Works

1. **Automatic Execution**: When the application starts, it automatically:
   - Checks for pending migrations in the `src/migrations` folder
   - Applies any migrations that haven't been run yet
   - Tracks applied migrations in the `migrations` table

2. **Migration Tracking**: A `migrations` table stores the history of all applied migrations with timestamps

3. **Rollback Support**: Each migration includes both `up()` and `down()` methods for forward and backward compatibility

## Creating a New Migration

### Step 1: Create a new migration file

Create a new file in `src/migrations/` with a descriptive name:

- Use a numbering prefix: `002_add_feature_X.ts`, `003_update_schema.ts`, etc.
- Keep names descriptive and in snake_case

### Step 2: Implement the migration

```typescript
import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { Migration } from "./runner";

const migration: Migration = {
  async up(db: Database<sqlite3.Database>) {
    // Apply schema changes here
    await db.exec(`
      CREATE TABLE IF NOT EXISTS new_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `);

    // Populate data if needed
    await db.run("INSERT INTO new_table (name) VALUES (?)", "example");
  },

  async down(db: Database<sqlite3.Database>) {
    // Reverse the changes here
    await db.exec("DROP TABLE IF EXISTS new_table");
  },
};

export default migration;
```

### Step 3: Test your migration

Run your application:

```bash
npm start
```

You should see output like:

```
→ Running migration: 002_add_feature_X
✓ Migration completed: 002_add_feature_X
```

## Migration Examples

### Adding a new table

```typescript
async up(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      level TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async down(db) {
  await db.exec("DROP TABLE IF EXISTS logs");
}
```

### Adding a column to an existing table

```typescript
async up(db) {
  await db.exec(`
    ALTER TABLE users ADD COLUMN last_login DATETIME
  `);
}

async down(db) {
  // SQLite doesn't support DROP COLUMN easily, so we'd need to recreate the table
  // For simpler cases, consider if you really need to rollback
  await db.exec(`
    ALTER TABLE users DROP COLUMN last_login
  `);
}
```

### Creating an index

```typescript
async up(db) {
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
  `);
}

async down(db) {
  await db.exec("DROP INDEX IF EXISTS idx_users_username");
}
```

## Migration Status

To check which migrations have been applied, you can query the database:

```sql
SELECT * FROM migrations ORDER BY applied_at;
```

## Best Practices

1. **Keep migrations small and focused** - One change per migration makes them easier to understand and debug

2. **Always include both `up` and `down`** - Even if you think you'll never rollback, it's good practice

3. **Test thoroughly** - Run migrations multiple times to ensure idempotency

4. **Use `IF NOT EXISTS` / `IF EXISTS`** - Prevents errors if a migration runs multiple times

5. **Document complex migrations** - Add comments explaining what the migration does

6. **Never modify applied migrations** - Once a migration is deployed, treat it as immutable. Create a new migration for changes

7. **Handle data transformations carefully** - Use transactions and validate data after migrations

```typescript
async up(db) {
  // Wrap in transaction for safety
  await db.exec("BEGIN TRANSACTION");
  try {
    // Your migration code
    await db.run("UPDATE table SET column = ?", value);
    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
}
```

## Troubleshooting

**Migration fails during startup:**

1. Check the error message for details
2. Ensure the migration file follows the correct format
3. Check SQLite syntax in your migration
4. Verify database file permissions

**Migration appears to run multiple times:**

1. Check that migrations table exists: `SELECT * FROM migrations`
2. Verify migration filename hasn't changed
3. Check for duplicate migration names

**Need to rollback?**

1. Create a new migration that reverses the changes
2. Don't try to modify applied migrations
3. Document why the rollback is needed
