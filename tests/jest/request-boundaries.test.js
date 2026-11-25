'use strict';
const request = require('supertest');
const { app, setupTestDb, resetTasksTable, getAuthToken } = require('./helpers');

describe('Request boundary regression tests', () => {
  let token;
  beforeAll(async () => { await setupTestDb(); token = await getAuthToken(); });
  beforeEach(() => resetTasksTable());
  const auth = () => 'Bearer ' + token;
  test.each([null, 42, {}, ''])('rejects invalid update title %p', async title => {
    const res = await request(app).put('/tasks/1').set('Authorization', auth()).send({ title });
    expect(res.status).toBe(400);
  });
  test.each([null, 42, {}])('rejects invalid description %p', async description => {
    const res = await request(app).post('/tasks').set('Authorization', auth()).send({ title: 'Valid', description });
    expect(res.status).toBe(400);
  });
  test.each(['1abc', '1.5', '9007199254740992'])('rejects malformed ID %s', async id => {
    expect((await request(app).get('/tasks/' + id).set('Authorization', auth())).status).toBe(400);
  });
  test('malformed JSON returns 400', async () => {
    expect((await request(app).post('/auth/login').set('Content-Type', 'application/json').send('{')).status).toBe(400);
  });
  test('oversized JSON returns 413', async () => {
    expect((await request(app).post('/auth/login').send({ username: 'x'.repeat(110000) })).status).toBe(413);
  });
  test('health response omits framework identification', async () => {
    expect((await request(app).get('/health')).headers['x-powered-by']).toBeUndefined();
  });
});
