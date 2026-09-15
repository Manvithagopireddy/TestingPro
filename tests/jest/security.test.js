'use strict';

const request = require('supertest');
const { app, setupTestDb, resetTasksTable, getAuthToken } = require('./helpers');

describe('Security, Auth Guard & Resilience Testing (Jest + Supertest)', () => {
  let authToken;

  beforeAll(async () => {
    await setupTestDb();
    authToken = await getAuthToken();
  });

  beforeEach(() => {
    resetTasksTable();
  });

  describe('JWT Authentication Guard (401 Unauthorized)', () => {
    it('should return 401 when Authorization header is omitted on GET /tasks', async () => {
      const res = await request(app).get('/tasks');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
      expect(res.body.message).toContain('Missing or malformed Authorization header');
    });

    it('should return 401 when Authorization header is omitted on POST /tasks', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Unauthenticated Task' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 401 when Authorization header uses Basic instead of Bearer', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', 'Basic dXNlcjpwYXNz');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Missing or malformed Authorization header');
    });

    it('should return 401 when Bearer token is a random invalid string', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', 'Bearer completely_fake_token_12345');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid token');
    });

    it('should return 401 when token signature is tampered', async () => {
      // Tamper last 5 characters of valid token
      const tampered = authToken.slice(0, -5) + '99999';
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${tampered}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid token');
    });
  });

  describe('SQL Injection Prevention & Parameterized Queries', () => {
    it('should safely store SQL injection payload in title without executing commands', async () => {
      const sqlInjectionPayload = "'; DROP TABLE tasks; --";

      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: sqlInjectionPayload,
          description: 'SQLi resilience check',
        });

      expect(res.status).toBe(201);
      expect(res.body.task.title).toBe(sqlInjectionPayload);

      // Verify table still exists and seed tasks are intact
      const listRes = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.count).toBe(4); // 3 seed tasks + 1 injection task
    });

    it('should reject non-numeric SQL injection strings in path parameters with 400', async () => {
      const res = await request(app)
        .get("/tasks/' OR '1'='1")
        .set('Authorization', `Bearer ${authToken}`);

      // Path validation rejects non-numeric IDs before touching the DB
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Bad Request');
      expect(res.body.message).toBe('"id" must be a positive integer.');
    });

    it('should safely treat parameterized numeric SQL injection strings without executing syntax', async () => {
      // In JS, parseInt("1' OR '1'='1", 10) evaluates to 1, and parameterized query binds safely to row 1
      const res = await request(app)
        .get("/tasks/1' OR '1'='1")
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.task.id).toBe(1);
    });
  });

  describe('404 Route Handling', () => {
    it('should return standard 404 JSON for non-existent API routes', async () => {
      const res = await request(app).get('/api/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
      expect(res.body.message).toContain('Route GET /api/does-not-exist does not exist.');
    });
  });
});
