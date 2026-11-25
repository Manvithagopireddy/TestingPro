'use strict';

const express = require('express');
const { authenticate } = require('./middleware/auth');
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');

const app = express();
app.disable('x-powered-by');

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
  });
});

module.exports = app;
