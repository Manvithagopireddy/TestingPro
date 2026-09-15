'use strict';

const request = require('supertest');
const { app, setupTestDb, TEST_USER } = require('./helpers');

describe('Authentication & Health Endpoints', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  describe('GET /health', () => {
    it('should return 200 OK with status and timestamp', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('timestamp');
      expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
    });
  });

  describe('POST /auth/login', () => {
    it('should return 200 and a valid JWT token on correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: TEST_USER.username,
          password: TEST_USER.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.split('.').length).toBe(3); // Standard JWT format
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toEqual({
        username: TEST_USER.username,
        role: 'tester',
      });
    });

    it('should return 401 when password is wrong', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: TEST_USER.username,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
      expect(res.body).toHaveProperty('message');
    });

    it('should return 401 when username is unknown', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'unknown_user',
          password: TEST_USER.password,
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 400 when username is missing', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ password: TEST_USER.password });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Bad Request');
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: TEST_USER.username });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Bad Request');
    });

    it('should return 400 when body is empty', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Bad Request');
    });
  });
});
