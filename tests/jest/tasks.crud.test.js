'use strict';

const request = require('supertest');
const { app, setupTestDb, resetTasksTable, getAuthToken } = require('./helpers');

describe('Tasks CRUD Lifecycle (Programmatic Integration)', () => {
  let authToken;

  beforeAll(async () => {
    await setupTestDb();
    authToken = await getAuthToken();
  });

  beforeEach(() => {
    resetTasksTable();
  });

  describe('GET /tasks', () => {
    it('should return 200 and a list of all seed tasks', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('count', 3);
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.tasks.length).toBe(3);

      const firstTask = res.body.tasks[0];
      expect(firstTask).toHaveProperty('id');
      expect(firstTask).toHaveProperty('title');
      expect(firstTask).toHaveProperty('description');
      expect(firstTask).toHaveProperty('status');
      expect(firstTask).toHaveProperty('createdAt');
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task with status pending by default', async () => {
      const payload = {
        title: 'Learn Jest and Supertest',
        description: 'Implement integration testing in Node.js',
      };

      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Task created successfully.');
      expect(res.body.task).toHaveProperty('id');
      expect(res.body.task.title).toBe(payload.title);
      expect(res.body.task.description).toBe(payload.description);
      expect(res.body.task.status).toBe('pending');
      expect(res.body.task).toHaveProperty('createdAt');
    });

    it('should create a task with an explicit status if valid', async () => {
      const payload = {
        title: 'Already completed task',
        description: 'Completed immediately',
        status: 'completed',
      };

      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.task.status).toBe('completed');
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return 200 and the requested task when it exists', async () => {
      const res = await request(app)
        .get('/tasks/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('task');
      expect(res.body.task.id).toBe(1);
      expect(res.body.task.title).toBe('Write unit tests');
    });

    it('should return 404 if the task id does not exist', async () => {
      const res = await request(app)
        .get('/tasks/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update task title, description, and status', async () => {
      const updateData = {
        title: 'Updated title for task 1',
        description: 'Updated description',
        status: 'completed',
      };

      const res = await request(app)
        .put('/tasks/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Task updated successfully.');
      expect(res.body.task.id).toBe(1);
      expect(res.body.task.title).toBe(updateData.title);
      expect(res.body.task.description).toBe(updateData.description);
      expect(res.body.task.status).toBe('completed');
    });

    it('should partially update task fields without changing omitted fields', async () => {
      const res = await request(app)
        .put('/tasks/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('completed');
      expect(res.body.task.title).toBe('Write unit tests'); // unchanged
    });

    it('should return 404 when updating a non-existent task', async () => {
      const res = await request(app)
        .put('/tasks/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Non-existent task' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete an existing task and return 200', async () => {
      const res = await request(app)
        .delete('/tasks/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Task with id 1 deleted successfully.');
      expect(res.body.deletedTask.id).toBe(1);

      // Verify deletion
      const verifyRes = await request(app)
        .get('/tasks/1')
        .set('Authorization', `Bearer ${authToken}`);
      expect(verifyRes.status).toBe(404);
    });

    it('should return 404 when deleting a non-existent task', async () => {
      const res = await request(app)
        .delete('/tasks/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
    });
  });
});
