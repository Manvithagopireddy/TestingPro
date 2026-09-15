'use strict';

/**
 * seed.js — Resets the SQLite database to a known state using sql.js.
 *
 * Usage:
 *   node scripts/seed.js
 *   npm run seed
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'tasks.db');

async function seed() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(); // always start fresh in-memory

  // ── Reset schema ──────────────────────────────────────────────────────────
  db.run(`
    CREATE TABLE tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'pending'
                          CHECK(status IN ('pending', 'completed')),
      createdAt   TEXT    NOT NULL
                          DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `);

  // ── Seed data ──────────────────────────────────────────────────────────────
  const seedTasks = [
    { title: 'Write unit tests',     description: 'Cover all service-layer functions with Jest',          status: 'pending'   },
    { title: 'Set up CI pipeline',   description: 'Configure GitHub Actions for automated test runs',    status: 'completed' },
    { title: 'Review pull requests', description: 'Review the open PRs in the repository',              status: 'pending'   },
  ];

  for (const task of seedTasks) {
    db.run(
      `INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)`,
      [task.title, task.description, task.status]
    );
  }

  // ── Persist to disk ───────────────────────────────────────────────────────
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();

  // Verify
  const count = seedTasks.length;
  console.log(`\n✅  Database seeded successfully.`);
  console.log(`   Path    : ${DB_PATH}`);
  console.log(`   Tasks   : ${count} rows inserted\n`);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
