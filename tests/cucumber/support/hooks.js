'use strict';

const { BeforeAll, Before } = require('@cucumber/cucumber');
const { initDb, run, persist } = require('../../../src/db');

BeforeAll(async function () {
  await initDb();
});

Before(function () {
  // Reset tasks table to known baseline test fixtures
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

  // Reset scenario execution state
  this.token = null;
  this.response = null;
  this.createdTaskId = null;
  this.lastCreatedTask = null;
  this.testData = {};
});
