'use strict';

// This application is a local test fixture, not a production authentication service.
if (process.env.NODE_ENV === 'production') {
  throw new Error('TestingPro is a demo API and must not run in production mode.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-portfolio-demo';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const PORT = process.env.PORT || 3000;

// Hardcoded test credentials (fine for a demo/portfolio project)
const TEST_USER = {
  username: 'testuser',
  password: 'password123',
};

module.exports = { JWT_SECRET, JWT_EXPIRY, PORT, TEST_USER };
