import request from 'supertest';
import app from '../src/server.js'; // Adjust path to your server file

describe('📌 GET /users', () => {
  test('✅ should return list of users successfully', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
