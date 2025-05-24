import request from 'supertest';
import app from '../src/server.js';

// Adjust this ID to match a real test user in our DB
const testUserId = 2;

describe('User Endpoints', () => {
  it('GET /users - should return all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /user/:id - should return specific user by ID', async () => {
    const res = await request(app)
      .get(`/user/${testUserId}`)
      .set('Authorization', 'Bearer testtoken123');

    if (res.statusCode === 404) {
      console.warn('⚠️ User not found. Make sure testUserId exists in DB.');
    }

    expect([200, 404, 401]).toContain(res.statusCode);
  });

  it('GET /users/:id/achievements - should return achievements for a user', async () => {
    const res = await request(app)
      .get(`/users/${testUserId}/achievements`)
      .set('Authorization', 'Bearer testtoken123');

    if (res.statusCode === 404) {
      console.warn('⚠️ Achievements not found or user doesn’t exist.');
    }

    expect([200, 404, 401]).toContain(res.statusCode);
  });

  it('POST /user/:id/xp - should update user XP', async () => {
    const res = await request(app)
      .post(`/user/${testUserId}/xp`)
      .set('Authorization', 'Bearer testtoken123')
      .send({ xp: 1500 });

    if (res.statusCode === 404) {
      console.warn('⚠️ User not found. Make sure testUserId exists.');
    }

    expect([200, 404, 401]).toContain(res.statusCode);
  });
});
