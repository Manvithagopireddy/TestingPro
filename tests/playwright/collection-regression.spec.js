'use strict';

// Additional API contract checks replacing unsafe Newman dependency execution.
// The original Postman collection is retained for manual import/reference.
const { test, expect } = require('@playwright/test');

const credentials = { username: 'testuser', password: 'password123' };
async function tokenFor(request) {
  const response = await request.post('/auth/login', { data: credentials });
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.token).toBeTruthy();
  return data.token;
}

test('rejects malformed logins', async ({ request }) => {
  for (const body of [{}, { username: 'testuser' }]) {
    const response = await request.post('/auth/login', { data: body });
    expect(response.status()).toBe(400);
  }
  const incorrect = await request.post('/auth/login', {
    data: { username: 'testuser', password: 'wrong-password' },
  });
  expect(incorrect.status()).toBe(401);
});

test('rejects forged and absent authentication', async ({ request }) => {
  const bad = await request.get('/tasks', {
    headers: { Authorization: 'Bearer invalid.token.here' },
  });
  expect(bad.status()).toBe(401);
  const missing = await request.post('/tasks', { data: { title: 'Unauthorized' } });
  expect(missing.status()).toBe(401);
});

test('validates task creation fields and boundaries', async ({ request }) => {
  const token = await tokenFor(request);
  const headers = { Authorization: `Bearer ${token}` };
  for (const payload of [
    { title: '' },
    { title: '   ' },
    { title: 12 },
    { title: 'x'.repeat(501) },
    { title: 'Valid title', status: 'invalid' },
    { title: 'Valid title', description: 42 },
  ]) {
    const response = await request.post('/tasks', { headers, data: payload });
    expect(response.status()).toBe(400);
  }
});

test('task resource lifecycle returns standard errors', async ({ request }) => {
  const token = await tokenFor(request);
  const headers = { Authorization: `Bearer ${token}` };
  const created = await request.post('/tasks', {
    headers,
    data: { title: 'Collection parity check', description: 'API regression coverage' },
  });
  expect(created.status()).toBe(201);
  const body = await created.json();
  const taskId = body.task.id;

  const getTask = await request.get(`/tasks/${taskId}`, { headers });
  expect(getTask.status()).toBe(200);
  expect((await getTask.json()).task.title).toBe('Collection parity check');

  const updateInvalid = await request.put(`/tasks/${taskId}`, {
    headers,
    data: { title: null },
  });
  expect(updateInvalid.status()).toBe(400);

  const deleted = await request.delete(`/tasks/${taskId}`, { headers });
  expect(deleted.status()).toBe(200);

  const gone = await request.get(`/tasks/${taskId}`, { headers });
  expect(gone.status()).toBe(404);
});

test('rejects invalid task identifiers without partial parsing', async ({ request }) => {
  const token = await tokenFor(request);
  const headers = { Authorization: `Bearer ${token}` };
  for (const id of ['0', '-1', '1abc', '1.5', '999999999999999999999']) {
    expect((await request.get(`/tasks/${id}`, { headers })).status()).toBe(400);
  }
});

test('preserves malicious-looking titles without executing SQL', async ({ request }) => {
  const token = await tokenFor(request);
  const headers = { Authorization: `Bearer ${token}` };
  const title = "'; DROP TABLE tasks; --";
  const created = await request.post('/tasks', { headers, data: { title } });
  expect(created.status()).toBe(201);
  const { task } = await created.json();
  expect(task.title).toBe(title);
  const listed = await request.get('/tasks', { headers });
  expect(listed.status()).toBe(200);
  const data = await listed.json();
  expect(data.tasks.some((item) => item.id === task.id)).toBe(true);
});
