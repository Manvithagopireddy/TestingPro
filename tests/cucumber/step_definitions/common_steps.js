'use strict';

const { Then } = require('@cucumber/cucumber');
const assert = require('assert');

Then('the response status code should be {int}', function (expectedStatus) {
  assert(this.response, 'No response received yet');
  assert.strictEqual(
    this.response.status,
    expectedStatus,
    `Expected HTTP ${expectedStatus} but received HTTP ${this.response.status}. Body: ${JSON.stringify(this.response.body)}`
  );
});

Then('the response error should be {string}', function (expectedError) {
  assert(this.response, 'No response received yet');
  assert.strictEqual(
    this.response.body.error,
    expectedError,
    `Expected error "${expectedError}" but received "${this.response.body.error}"`
  );
});

Then('the response message should contain {string}', function (expectedSnippet) {
  assert(this.response, 'No response received yet');
  const message = this.response.body.message || '';
  assert(
    message.includes(expectedSnippet),
    `Expected message to contain "${expectedSnippet}", received: "${message}"`
  );
});

Then('the response body should have property {string}', function (prop) {
  assert(this.response, 'No response received yet');
  assert(
    Object.prototype.hasOwnProperty.call(this.response.body, prop),
    `Expected property "${prop}" in response body: ${JSON.stringify(this.response.body)}`
  );
});

Then('the response body property {string} should equal {string}', function (prop, expectedVal) {
  assert(this.response, 'No response received yet');
  assert.strictEqual(
    String(this.response.body[prop]),
    expectedVal,
    `Expected ${prop} to equal "${expectedVal}", got "${this.response.body[prop]}"`
  );
});
