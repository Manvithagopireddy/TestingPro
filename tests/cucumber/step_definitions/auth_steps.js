'use strict';

const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const { TEST_USER, JWT_SECRET } = require('../../../src/config');

Given('I am authenticated with valid credentials', async function () {
  const res = await this.request
    .post('/auth/login')
    .send({ username: TEST_USER.username, password: TEST_USER.password });
  assert.strictEqual(res.status, 200, 'Failed to authenticate in Given step');
  assert(res.body.token, 'No token returned from /auth/login');
  this.token = res.body.token;
});

Given('I have no authentication token', function () {
  this.token = null;
});

Given('I have an invalid Bearer token', function () {
  this.token = 'invalid.jwt.token.string';
});

Given('I have a tampered Bearer token', function () {
  // Sign with an incorrect secret key
  this.token = jwt.sign({ username: 'hacker', role: 'admin' }, 'wrong-secret-key-12345');
});

When('I send a POST request to {string} with credentials:', async function (endpoint, dataTable) {
  const data = dataTable.rowsHash();
  this.response = await this.request.post(endpoint).send(data);
});

When('I send a POST request to {string} with empty body', async function (endpoint) {
  this.response = await this.request.post(endpoint).send({});
});

When('I send a GET request to {string}', async function (endpoint) {
  let req = this.request.get(endpoint);
  if (this.token) {
    req = req.set('Authorization', `Bearer ${this.token}`);
  }
  this.response = await req;
});

When('I send a GET request to {string} with header {string} set to {string}', async function (endpoint, headerName, headerVal) {
  this.response = await this.request.get(endpoint).set(headerName, headerVal);
});

Then('the response should contain a valid JWT token', function () {
  assert(this.response, 'No response received');
  const token = this.response.body.token;
  assert(token, 'Expected response body to contain token');
  const decoded = jwt.verify(token, JWT_SECRET);
  assert.strictEqual(decoded.username, TEST_USER.username);
});

Then('the user username should be {string}', function (expectedUsername) {
  assert(this.response, 'No response received');
  assert(this.response.body.user, 'Expected response to contain user object');
  assert.strictEqual(this.response.body.user.username, expectedUsername);
});
