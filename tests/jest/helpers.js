'use strict';

const request = require('supertest');
const app = require('../../src/app');
const { initDb, run, persist } = require('../../src/db');
const { TEST_USER } = require('../../src/config');

/**
 * Initializes the database for Jest runs.
 */
async function setupTestDb() {
  await initDb();
}

/**
 * Resets tasks table back to 3 known seed tasks.
 */
function resetTasksTable() {
  run('DELETE FROM tasks;');
  run('DELETE FROM sqlite_sequence WHERE name="tasks";');

  const seedTasks = [
    { title: 'Write unit tests', description: 'Cover all service-layer functions with Jest', status: 'pending' },
    { title: 'Set up CI pipeline', description: 'Configure GitHub Actions for automated test runs', status: 'completed' },
    { title: 'Review pull requests', description: 'Review the open PRs in the repository', status: 'pending' },
  ];

  for (const t of seedTasks) {
    run('INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)', [t.title, t.description, t.status]);
  }
  persist();
}

/**
 * Helper to acquire a valid Bearer token via /auth/login.
 */
async function getAuthToken() {
  const res = await request(app)
    .post('/auth/login')
    .send({ username: TEST_USER.username, password: TEST_USER.password });
  return res.body.token;
}

module.exports = {
  app,
  setupTestDb,
  resetTasksTable,
  getAuthToken,
  TEST_USER,
};
