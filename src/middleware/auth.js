'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

/**
 * Middleware: verifies Authorization: Bearer <token>
 * Returns 401 if the header is missing or the token is invalid/expired.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token',
    });
  }
}

module.exports = { authenticate };
