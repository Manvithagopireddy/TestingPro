'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY, TEST_USER } = require('../config');

const router = express.Router();

/**
 * POST /auth/login
 * Body: { username, password }
 * Returns: { token, expiresIn }
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  // Validate presence of fields
  if (!username || !password) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Both "username" and "password" fields are required.',
    });
  }

  // Check credentials against hardcoded test user
  if (username !== TEST_USER.username || password !== TEST_USER.password) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid username or password.',
    });
  }

  // Issue JWT
  const payload = { username, role: 'tester' };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

  return res.status(200).json({
    message: 'Login successful',
    token,
    expiresIn: JWT_EXPIRY,
    user: { username, role: 'tester' },
  });
});

module.exports = router;
