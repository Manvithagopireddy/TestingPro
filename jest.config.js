'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/jest/**/*.test.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // Exclude server.js (starts live port)
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
};
