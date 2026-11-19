import 'server-only';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

let db: DatabaseSync | null = null;

/** SQLite file in DATA_DIR (a persistent volume on Coolify). Opened lazily so the build never touches it. */
export function getDb() {
  if (!db) {
    const dir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    mkdirSync(dir, { recursive: true });
    db = new DatabaseSync(path.join(dir, 'turbo-tables.db'));
    db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, ts INTEGER NOT NULL, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS docs (name TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
    `);
  }
  return db;
}
