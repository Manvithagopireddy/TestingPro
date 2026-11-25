'use strict';

const express = require('express');
const { authenticate } = require('./middleware/auth');
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');

const app = express();
app.disable('x-powered-by');

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Health check (public, no auth)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/tasks', authenticate, tasksRouter);   // all /tasks require valid JWT

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist.`,
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Bad Request', message: 'Malformed JSON.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload Too Large', message: 'Request body exceeds the limit.' });
  }
  console.error('[ERROR]', err.name);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
  });
});

module.exports = app;
