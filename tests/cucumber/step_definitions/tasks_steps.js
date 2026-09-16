'use strict';

const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const db = require('../../../src/db');

When('I send a POST request to {string} with:', async function (endpoint, dataTable) {
  const payload = dataTable.rowsHash();
  let req = this.request.post(endpoint);
  if (this.token) {
    req = req.set('Authorization', `Bearer ${this.token}`);
  }
  this.response = await req.send(payload);

  if (this.response.body && this.response.body.task && this.response.body.task.id) {
    this.createdTaskId = this.response.body.task.id;
    this.lastCreatedTask = this.response.body.task;
  }
});

When('I send a POST request to {string} without authorization with:', async function (endpoint, dataTable) {
  const payload = dataTable.rowsHash();
  this.response = await this.request.post(endpoint).send(payload);
});

When('I send a POST request to {string} with raw json:', async function (endpoint, docString) {
  const payload = JSON.parse(docString);
  let req = this.request.post(endpoint);
  if (this.token) {
    req = req.set('Authorization', `Bearer ${this.token}`);
  }
  this.response = await req.send(payload);

  if (this.response.body && this.response.body.task && this.response.body.task.id) {
    this.createdTaskId = this.response.body.task.id;
    this.lastCreatedTask = this.response.body.task;
  }
});

When('I send a POST request to {string} with title of length {int}', async function (endpoint, length) {
  const title = 'A'.repeat(length);
  let req = this.request.post(endpoint);
  if (this.token) {
    req = req.set('Authorization', `Bearer ${this.token}`);
  }
  this.response = await req.send({ title });

  if (this.response.body && this.response.body.task && this.response.body.task.id) {
    this.createdTaskId = this.response.body.task.id;
    this.lastCreatedTask = this.response.body.task;
  }
});

When('I send a GET request to the created task', async function () {
  assert(this.createdTaskId, 'No created task ID found');
  let req = this.request.get(`/tasks/${this.createdTaskId}`);
  if (this.token) {
    req = req.set('Authorization', `Bearer ${this.token}`);
  }
  this.response = await req;
});

When('I send a PUT request to the created task with:', async function (dataTable) {
  assert(this.createdTaskId, 'No created task ID found');
  const payload = dataTable.rowsHash();
  let req = this.request.put(`/tasks/${this.createdTaskId}`);
  if (this.token) {
    req = req.set('Authorization', `Bearer ${this.token}`);
  }
  this.response = await req.send(payload);
});

When('I send a PUT request to {string} with:', async function (endpoint, dataTable) {
  const payload = dataTable.rowsHash();
  let req = this.request.put(endpoint);
  if (this.token) {
    req = req.set('Authorization', `Bearer ${this.token}`);
  }
  this.response = await req.send(payload);
});

When('I send a DELETE request to the created task', async function () {
  assert(this.createdTaskId, 'No created task ID found');
  let req = this.request.delete(`/tasks/${this.createdTaskId}`);
  if (this.token) {
    req = req.set('Authorization', `Bearer ${this.token}`);
  }
  this.response = await req;
});

When('I send a DELETE request to {string}', async function (endpoint) {
  let req = this.request.delete(endpoint);
  if (this.token) {
    req = req.set('Authorization', `Bearer ${this.token}`);
  }
  this.response = await req;
});

Then('the task count should be {int}', function (expectedCount) {
  assert(this.response, 'No response received');
  assert.strictEqual(this.response.body.count, expectedCount);
  assert(Array.isArray(this.response.body.tasks), 'Expected tasks to be an array');
  assert.strictEqual(this.response.body.tasks.length, expectedCount);
});

Then('the response body should contain the created task', function () {
  assert(this.response, 'No response received');
  assert(this.response.body.task, 'Expected response to contain task object');
  assert(this.response.body.task.id, 'Expected task object to have an id');
});

Then('the created task status should be {string}', function (expectedStatus) {
  const task = (this.response.body && this.response.body.task) || this.lastCreatedTask;
  assert(task, 'No task object found');
  assert.strictEqual(task.status, expectedStatus);
});

Then('the created task title should be {string}', function (expectedTitle) {
  const task = (this.response.body && this.response.body.task) || this.lastCreatedTask;
  assert(task, 'No task object found');
  assert.strictEqual(task.title, expectedTitle);
});

Then('the created task description should be {string}', function (expectedDesc) {
  const task = (this.response.body && this.response.body.task) || this.lastCreatedTask;
  assert(task, 'No task object found');
  assert.strictEqual(task.description, expectedDesc);
});

Then('the database should contain a task with title {string}', function (title) {
  const task = db.queryOne('SELECT * FROM tasks WHERE title = ?', [title]);
  assert(task, `Expected database to contain task with title "${title}"`);
});

Then('the database should still have {int} tasks', function (expectedTotal) {
  const rows = db.query('SELECT * FROM tasks');
  assert.strictEqual(rows.length, expectedTotal, `Expected ${expectedTotal} tasks in database, found ${rows.length}`);
});
