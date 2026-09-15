'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['pending', 'completed'];

function validateTaskPayload(body, requireTitle = true) {
  const errors = [];

  if (requireTitle && (!body.title || typeof body.title !== 'string' || body.title.trim() === '')) {
    errors.push('"title" is required and must be a non-empty string.');
  }

  if (body.title !== undefined && typeof body.title === 'string' && body.title.trim().length > 500) {
    errors.push('"title" must not exceed 500 characters.');
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`"status" must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  return errors;
}

// ── POST /tasks ───────────────────────────────────────────────────────────────

router.post('/', (req, res) => {
  const body = req.body || {};
  const errors = validateTaskPayload(body, true);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Bad Request', message: 'Validation failed.', details: errors });
  }

  const { title, description = '', status = 'pending' } = body;

  try {
    const result = db.run(
      `INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)`,
      [title.trim(), description.trim(), status]
    );
    const task = db.queryOne('SELECT * FROM tasks WHERE id = ?', [result.lastInsertRowid]);
    return res.status(201).json({ message: 'Task created successfully.', task });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// ── GET /tasks ────────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  try {
    const tasks = db.query('SELECT * FROM tasks ORDER BY id ASC');
    return res.status(200).json({ count: tasks.length, tasks });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// ── GET /tasks/:id ────────────────────────────────────────────────────────────

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Bad Request', message: '"id" must be a positive integer.' });
  }

  try {
    const task = db.queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Not Found', message: `Task with id ${id} does not exist.` });
    }
    return res.status(200).json({ task });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// ── PUT /tasks/:id ────────────────────────────────────────────────────────────

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Bad Request', message: '"id" must be a positive integer.' });
  }

  const body = req.body || {};
  const errors = validateTaskPayload(body, false);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Bad Request', message: 'Validation failed.', details: errors });
  }

  try {
    const existing = db.queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Not Found', message: `Task with id ${id} does not exist.` });
    }

    const updatedTitle       = body.title       !== undefined ? body.title.trim()       : existing.title;
    const updatedDescription = body.description !== undefined ? body.description.trim() : existing.description;
    const updatedStatus      = body.status      !== undefined ? body.status             : existing.status;

    db.run(
      `UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?`,
      [updatedTitle, updatedDescription, updatedStatus, id]
    );

    const updatedTask = db.queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Task updated successfully.', task: updatedTask });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// ── DELETE /tasks/:id ─────────────────────────────────────────────────────────

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Bad Request', message: '"id" must be a positive integer.' });
  }

  try {
    const existing = db.queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Not Found', message: `Task with id ${id} does not exist.` });
    }

    db.run('DELETE FROM tasks WHERE id = ?', [id]);
    return res.status(200).json({ message: `Task with id ${id} deleted successfully.`, deletedTask: existing });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

module.exports = router;
