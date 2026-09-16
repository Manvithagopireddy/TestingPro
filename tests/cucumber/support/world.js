'use strict';

const { setWorldConstructor, World } = require('@cucumber/cucumber');
const request = require('supertest');
const app = require('../../../src/app');

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.app = app;
    this.request = request(app);
    this.token = null;
    this.response = null;
    this.createdTaskId = null;
    this.lastCreatedTask = null;
    this.testData = {};
  }
}

setWorldConstructor(CustomWorld);
