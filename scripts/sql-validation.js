'use strict';

/**
 * sql-validation.js — Direct SQLite verification of API operations.
 *
 * Independently verifies that CRUD operations performed via the HTTP API
 * actually persisted correctly in the on-disk SQLite file.
 *
 * Reads the DB file directly using sql.js (no native compilation required).
 *
 * Usage:
 *   node scripts/sql-validation.js
 *   npm run validate:db
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

const DB_PATH  = path.join(__dirname, '..', 'tasks.db');
const API_BASE = 'http://localhost:3000';
const CREDS    = { username: 'testuser', password: 'password123' };

// ── Colour helpers ────────────────────────────────────────────────────────────
const GREEN  = (s) => `\x1b[32m${s}\x1b[0m`;
const RED    = (s) => `\x1b[31m${s}\x1b[0m`;
const YELLOW = (s) => `\x1b[33m${s}\x1b[0m`;
const BOLD   = (s) => `\x1b[1m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

function assert(description, condition, extra = '') {
  if (condition) {
    console.log(`  ${GREEN('✔')} ${description}`);
    passed++;
  } else {
    console.log(`  ${RED('✘')} ${description}${extra ? `  →  ${RED(extra)}` : ''}`);
    failed++;
  }
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
function httpRequest(method, urlPath, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: urlPath,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data  ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` }         : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => { raw += c; });
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
          catch { resolve({ status: res.statusCode, body: raw }); }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── DB reader — always reads fresh from disk ──────────────────────────────────
async function openDb(SQL) {
  if (!fs.existsSync(DB_PATH)) throw new Error(`Database not found at ${DB_PATH}. Run "npm run seed" first.`);
  const buf = fs.readFileSync(DB_PATH);
  return new SQL.Database(buf);
}

function dbQueryOne(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function dbQueryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log(BOLD('\n══════════════════════════════════════════════'));
  console.log(BOLD('  SQL Validation — Task Manager API'));
  console.log(BOLD('══════════════════════════════════════════════\n'));

  const SQL = await initSqlJs();

  // ── Step 1: Authenticate ──────────────────────────────────────────────────
  console.log(YELLOW('Step 1: Authenticate with API'));
  let token;
  try {
    const res = await httpRequest('POST', '/auth/login', CREDS, null);
    assert('Login returns HTTP 200', res.status === 200);
    assert('Response contains token', typeof res.body?.token === 'string' && res.body.token.length > 10);
    token = res.body?.token;
  } catch (err) {
    console.error(RED(`  ✘  Cannot connect to API at ${API_BASE}: ${err.message}`));
    console.error(RED('     Make sure the server is running with "npm start"\n'));
    process.exit(1);
  }

  // ── Step 2: Verify seed data in DB ────────────────────────────────────────
  console.log(YELLOW('\nStep 2: Verify seed data exists in DB'));
  {
    const db = await openDb(SQL);
    const allTasks = dbQueryAll(db, 'SELECT * FROM tasks ORDER BY id ASC');
    assert('At least 3 seed tasks exist in DB',   allTasks.length >= 3,                         `found ${allTasks.length}`);
    assert('Task 1 title is "Write unit tests"',  allTasks[0]?.title === 'Write unit tests');
    assert('Task 2 status is "completed"',        allTasks[1]?.status === 'completed');
    assert('Task 3 title is "Review pull requests"', allTasks[2]?.title === 'Review pull requests');
    db.close();
  }

  // ── Step 3: Create task via API → verify in DB ────────────────────────────
  console.log(YELLOW('\nStep 3: Create task via API → verify persistence in DB'));
  const newTask = { title: 'SQL Validation Test Task', description: 'Created by sql-validation.js', status: 'pending' };
  const createRes = await httpRequest('POST', '/tasks', newTask, token);
  assert('POST /tasks returns HTTP 201', createRes.status === 201);
  const createdId = createRes.body?.task?.id;
  assert('Response contains numeric task id', typeof createdId === 'number');

  {
    const db = await openDb(SQL);
    const row = dbQueryOne(db, 'SELECT * FROM tasks WHERE id = ?', [createdId]);
    assert('Row exists in DB after create',             !!row,                              `id=${createdId}`);
    assert('DB row title matches payload',              row?.title       === newTask.title);
    assert('DB row description matches payload',        row?.description === newTask.description);
    assert('DB row status matches payload',             row?.status      === newTask.status);
    assert('DB row has a createdAt timestamp',          typeof row?.createdAt === 'string' && row.createdAt.length > 0);
    db.close();
  }

  // ── Step 4: Update task via API → verify in DB ────────────────────────────
  console.log(YELLOW('\nStep 4: Update task via API → verify changes in DB'));
  const updatePayload = { status: 'completed', title: 'SQL Validation Task (Updated)' };
  const updateRes = await httpRequest('PUT', `/tasks/${createdId}`, updatePayload, token);
  assert('PUT /tasks/:id returns HTTP 200', updateRes.status === 200);

  {
    const db = await openDb(SQL);
    const row = dbQueryOne(db, 'SELECT * FROM tasks WHERE id = ?', [createdId]);
    assert('DB row status updated to "completed"',       row?.status === 'completed');
    assert('DB row title updated correctly',             row?.title  === 'SQL Validation Task (Updated)');
    assert('DB row description unchanged after update',  row?.description === newTask.description);
    db.close();
  }

  // ── Step 5: Delete task via API → verify removal ─────────────────────────
  console.log(YELLOW('\nStep 5: Delete task via API → verify removal from DB'));
  const deleteRes = await httpRequest('DELETE', `/tasks/${createdId}`, null, token);
  assert('DELETE /tasks/:id returns HTTP 200', deleteRes.status === 200);

  {
    const db = await openDb(SQL);
    const row = dbQueryOne(db, 'SELECT * FROM tasks WHERE id = ?', [createdId]);
    assert('Row no longer exists in DB after delete', !row, `row still present with id=${createdId}`);
    db.close();
  }

  // ── Step 6: Seed rows intact ──────────────────────────────────────────────
  console.log(YELLOW('\nStep 6: Verify original seed rows are still intact'));
  {
    const db = await openDb(SQL);
    const remaining = dbQueryAll(db, 'SELECT * FROM tasks ORDER BY id ASC');
    assert('Seed tasks still present after CRUD operations', remaining.length >= 3, `found ${remaining.length}`);
    db.close();
  }

  // ── Step 7: Boundary — 500-char title ────────────────────────────────────
  console.log(YELLOW('\nStep 7: Boundary — 500-character title persists correctly'));
  const longTitle = 'B'.repeat(500);
  const longRes = await httpRequest('POST', '/tasks', { title: longTitle }, token);
  assert('POST with max-length title returns 201', longRes.status === 201);
  const longId = longRes.body?.task?.id;
  if (longId) {
    const db = await openDb(SQL);
    const row = dbQueryOne(db, 'SELECT * FROM tasks WHERE id = ?', [longId]);
    assert('500-char title stored correctly in DB', row?.title === longTitle);
    db.close();
    await httpRequest('DELETE', `/tasks/${longId}`, null, token); // cleanup
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(BOLD('\n══════════════════════════════════════════════'));
  console.log(BOLD('  Results'));
  console.log(BOLD('══════════════════════════════════════════════'));
  console.log(`  ${GREEN(`✔ ${passed} passed`)}  ${failed > 0 ? RED(`✘ ${failed} failed`) : ''}`);
  console.log();

  if (failed > 0) {
    console.error(RED(`  ${failed} check(s) failed. See above for details.\n`));
    process.exit(1);
  } else {
    console.log(GREEN('  All SQL validation checks passed! ✓\n'));
    process.exit(0);
  }
}

run().catch((err) => {
  console.error(RED(`\nUnhandled error: ${err.message}`));
  process.exit(1);
});
