'use strict';

const request = require('supertest');
const { app, setupTestDb, resetTasksTable, getAuthToken } = require('./helpers');

describe('Input Validation & Boundary Testing (Jest + Supertest)', () => {
  let authToken;

  beforeAll(async () => {
    await setupTestDb();
    authToken = await getAuthToken();
  });

  beforeEach(() => {
    resetTasksTable();
  });

  describe('POST /tasks — Title Validation', () => {
    it('should reject missing title with 400', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Missing title' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Bad Request');
      expect(res.body.details).toContain('"title" is required and must be a non-empty string.');
    });

    it('should reject empty string title with 400', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '', description: 'Empty title' });

      expect(res.status).toBe(400);
      expect(res.body.details).toContain('"title" is required and must be a non-empty string.');
    });

    it('should reject whitespace-only title with 400', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '   ', description: 'Whitespace title' });

      expect(res.status).toBe(400);
      expect(res.body.details).toContain('"title" is required and must be a non-empty string.');
    });

    it('should reject title exceeding 500 characters with 400', async () => {
      const longTitle = 'a'.repeat(501);
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: longTitle });

      expect(res.status).toBe(400);
      expect(res.body.details).toContain('"title" must not exceed 500 characters.');
    });

    it('should accept title with exactly 500 characters (boundary test)', async () => {
      const maxTitle = 'x'.repeat(500);
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: maxTitle });

      expect(res.status).toBe(201);
      expect(res.body.task.title.length).toBe(500);
    });
  });

  describe('POST & PUT /tasks — Status Enum Validation', () => {
    it('should reject invalid status on create with 400', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Task', status: 'invalid_status' });

      expect(res.status).toBe(400);
      expect(res.body.details).toContain('"status" must be one of: pending, completed.');
    });

    it('should reject invalid status on update with 400', async () => {
      const res = await request(app)
        .put('/tasks/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'archived' });

      expect(res.status).toBe(400);
      expect(res.body.details).toContain('"status" must be one of: pending, completed.');
    });
  });

  describe('Path Parameter ID Validation', () => {
    it('should reject non-numeric ID on GET with 400', async () => {
      const res = await request(app)
        .get('/tasks/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Bad Request');
      expect(res.body.message).toBe('"id" must be a positive integer.');
    });

    it('should reject non-positive integer ID (0) with 400', async () => {
      const res = await request(app)
        .get('/tasks/0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('"id" must be a positive integer.');
    });

    it('should reject negative ID with 400 on PUT', async () => {
      const res = await request(app)
        .put('/tasks/-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Negative ID update' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('"id" must be a positive integer.');
    });

    it('should reject non-numeric ID on DELETE with 400', async () => {
      const res = await request(app)
        .delete('/tasks/notanumber')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('"id" must be a positive integer.');
    });
  });
});
