'use strict';

/**
 * db.js — SQLite via sql.js (pure JavaScript, no native compilation needed)
 *
 * sql.js keeps the database in memory and we manually save to disk on writes.
 * This gives us a real SQLite .db file for the SQL validation script to read.
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'tasks.db');

// ── Synchronous DB wrapper ────────────────────────────────────────────────────
// We return a synchronous-style object so the rest of the app code stays simple.
// sql.js itself is sync once initialized.

let _db = null;

function getDb() {
  if (!_db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return _db;
}

/**
 * Save current in-memory DB to disk (call after every write operation).
 */
function persist() {
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Initialize the database synchronously.
 * Returns a promise — call this once at startup with await.
 */
async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }

  // Create table if not exists
  _db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'pending'
                          CHECK(status IN ('pending', 'completed')),
      createdAt   TEXT    NOT NULL
                          DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `);
  persist();

  return _db;
}

/**
 * Run a query that returns rows (SELECT).
 * @param {string} sql
 * @param {Array}  params
 * @returns {Array<Object>}
 */
function query(sql, params = []) {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Run a query that returns at most one row.
 */
function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Run a write query (INSERT/UPDATE/DELETE).
 * Persists to disk automatically.
 * @returns {{ lastInsertRowid: number, changes: number }}
 */
function run(sql, params = []) {
  const db = getDb();
  db.run(sql, params);
  const changes = db.getRowsModified();

  // sql.js stores last insert rowid internally — retrieve it via SELECT
  const rowIdResult = db.exec('SELECT last_insert_rowid()');
  const lastInsertRowid = rowIdResult.length > 0
    ? rowIdResult[0].values[0][0]
    : null;

  persist();
  return { lastInsertRowid, changes };
}


module.exports = { initDb, query, queryOne, run, persist, DB_PATH };
