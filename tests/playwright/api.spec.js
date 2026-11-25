'use strict';

const { test, expect } = require('@playwright/test');

const USER = { username: 'testuser', password: 'password123' };

test('health endpoint reports success without framework header', async ({ request }) => {
  const response = await request.get('/health');
  expect(response.status()).toBe(200);
  expect((await response.json()).status).toBe('OK');
  expect(response.headers()['x-powered-by']).toBeUndefined();
});

test('missing JWT is rejected for protected task routes', async ({ request }) => {
  const response = await request.get('/tasks');
  expect(response.status()).toBe(401);
});

test('authenticated task creation, update and removal', async ({ request }) => {
  const login = await request.post('/auth/login', { data: USER });
  expect(login.status()).toBe(200);
  const { token } = await login.json();
  expect(token).toBeTruthy();
  const headers = { Authorization: `Bearer ${token}` };

  const create = await request.post('/tasks', {
    headers,
    data: { title: 'Playwright API workflow', description: 'API-only smoke test' },
  });
  expect(create.status()).toBe(201);
  const { task } = await create.json();
  expect(task.id).toBeGreaterThan(0);
  expect(task.status).toBe('pending');

  const update = await request.put(`/tasks/${task.id}`, {
    headers,
    data: { status: 'completed' },
  });
  expect(update.status()).toBe(200);
  expect((await update.json()).task.status).toBe('completed');

  const remove = await request.delete(`/tasks/${task.id}`, { headers });
  expect(remove.status()).toBe(200);
});

test('malformed identifier does not resolve to an existing task', async ({ request }) => {
  const login = await request.post('/auth/login', { data: USER });
  const { token } = await login.json();
  const response = await request.get('/tasks/1abc', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.status()).toBe(400);
});
