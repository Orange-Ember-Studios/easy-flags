# Database Initialization & Migrations

This document explains how the database is automatically initialized and kept up-to-date when your application starts.

## Overview

The application has an **automatic database initialization system** that:

1. ✅ **Creates the database** if it doesn't exist
2. ✅ **Applies all pending migrations** automatically on startup
3. ✅ **Tracks migration history** to prevent re-running migrations
4. ✅ **Seeds default data** (roles, permissions) on first run
5. ✅ **Enables WAL mode** for better database concurrency

## Startup Flow

When you start the application with `npm start`:

```
Application Start
    ↓
getDb() is called
    ↓
Database file is opened (created if missing)
    ↓
WAL mode is enabled
    ↓
Migrations table is created (if missing)
    ↓
Migration system runs:
    - Reads all .ts files from src/migrations/
    - Checks migrations table for applied migrations
    - Runs pending migrations in order
    - Records each applied migration
    ↓
Admin user is ensured to exist
    ↓
Server starts on port 3000
```

## How Migrations Work

### Migration System Architecture

```
src/migrations/
├── runner.ts                    # Migration runner & utilities
├── 001_initial_schema.ts        # Initial schema (tables, roles, permissions)
├── 002_add_feature_X.ts         # (Future migrations)
└── ...
```

### Execution Process

1. **Discovery**: All `.ts` migration files are discovered and sorted alphabetically
2. **Checking**: Each migration name is looked up in the `migrations` table
3. **Execution**: Pending migrations (not in the table) are executed via their `up()` method
4. **Recording**: Applied migration names are stored with timestamps

### Migration Files

Each migration file exports a `Migration` object with:

```typescript
{
  up(db):    Promise<void>   // Applies the migration
  down(db):  Promise<void>   // Reverts the migration (for documentation)
}
```

## Database Schema

### migrations Table

Automatically created to track applied migrations:

```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Current Schema (from 001_initial_schema.ts)

```
Tables:
├── roles                  # User roles (Admin, Editor, Viewer)
├── permissions            # Fine-grained permissions
├── role_permissions       # Mapping of roles to permissions
├── users                  # User accounts
├── environments           # Deployment environments
├── features               # Feature flags
├── feature_values         # Feature values per environment
└── subscriptions          # Billing subscriptions
```

## Key Features

### ✅ Automatic Initialization

- No manual database setup needed
- Works with first-time deployments
- Safe to run multiple times (idempotent)

### ✅ Default Data Seeding

The initial migration includes:

- **3 Roles**: Admin, Editor, Viewer
- **19 Permissions**: Fine-grained access control
- **Role Assignments**: Permissions mapped to each role

### ✅ Migration Idempotency

- Migrations can run multiple times without errors
- Uses `CREATE TABLE IF NOT EXISTS`
- Checks for existing data before seeding

### ✅ Version Control

- Each migration is a separate file
- Migration history is stored in the database
- Easy to see what's been applied

## Creating New Features

When adding new features that need database changes:

1. **Create a migration file** in `src/migrations/`:

   ```bash
   touch src/migrations/002_add_new_feature.ts
   ```

2. **Implement the migration** (see [MIGRATIONS.md](./MIGRATIONS.md)):

   ```typescript
   const migration: Migration = {
     async up(db) {
       // Add tables, columns, data, etc.
     },
     async down(db) {
       // Reverse changes (for documentation)
     },
   };
   ```

3. **Test it** by starting the app:

   ```bash
   npm start
   ```

4. **Commit to git** - The migration is now part of your codebase

5. **On deployment** - The migration automatically runs when the app starts

## Environment-Specific Setup

### Development

```bash
npm start
# Migrations run automatically
# Uses local data.db file
```

### Production

```bash
NODE_ENV=production npm start
# Migrations run automatically
# Uses production data.db path
# No manual setup needed
```

### Docker/Containers

```dockerfile
# Dockerfile
FROM node:18
WORKDIR /app
COPY . .
CMD npm start  # Migrations run automatically
```

## Monitoring

### Check Applied Migrations

```sql
sqlite3 data.db "SELECT * FROM migrations ORDER BY applied_at;"
```

### View Migration Output

When the app starts, you'll see:

```
→ Running migration: 001_initial_schema
✓ Migration completed: 001_initial_schema
Server running on http://localhost:3000
```

### View Database Schema

```bash
sqlite3 data.db ".tables"
sqlite3 data.db ".schema"
```

## Troubleshooting

### Migrations won't run

1. Check that migration files exist in `src/migrations/`
2. Ensure files end with `.ts` extension
3. Verify migration exports `Migration` interface
4. Check console output for specific error messages

### Database locked error

1. Close any other connections to `data.db`
2. Check for long-running transactions
3. Verify WAL files (`data.db-wal`, `data.db-shm`) exist

### Migration applied but changes not visible

1. Query the migrations table: `SELECT * FROM migrations`
2. Check database schema: `.schema migration_name`
3. Verify data directory: `ls -la data.db*`

### Need to reset database

```bash
rm data.db data.db-wal data.db-shm  # Delete database files
npm start                            # Fresh initialization
```

## Summary

This system ensures:

- ✅ **Zero-downtime deployments** - Migrations run automatically
- ✅ **Version-controlled schema** - All changes tracked in git
- ✅ **Easy rollback** - Each migration includes down() method
- ✅ **Team coordination** - Everyone uses the same migration system
- ✅ **Production-ready** - Works seamlessly in any environment

For detailed migration examples and best practices, see [MIGRATIONS.md](./MIGRATIONS.md).
