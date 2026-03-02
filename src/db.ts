import path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const dbFile = path.resolve(process.cwd(), 'data.db');

let dbInstance: Database<sqlite3.Database> | null = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  dbInstance = await open({ filename: dbFile, driver: sqlite3.Database });
  await dbInstance.exec('PRAGMA journal_mode = WAL');

  await dbInstance.exec(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`
  );

  await dbInstance.exec(
    `CREATE TABLE IF NOT EXISTS environments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )`
  );

  await dbInstance.exec(
    `CREATE TABLE IF NOT EXISTS features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      description TEXT
    )`
  );

  await dbInstance.exec(
    `CREATE TABLE IF NOT EXISTS feature_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feature_id INTEGER NOT NULL,
      environment_id INTEGER NOT NULL,
      value INTEGER NOT NULL,
      UNIQUE(feature_id, environment_id)
    )`
  );

  return dbInstance;
}

export default getDb;
