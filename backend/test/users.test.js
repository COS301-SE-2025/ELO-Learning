// tests/users.test.js
const request = require('supertest');
const app = require('../app'); // Adjust path to your Express app

describe('GET /users', () => {
  test('✅ should return list of users successfully', async () => {
    const res = await request(app).get('/users');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('username');
  });

  test('⚠️ edge case: should handle no users in the system', async () => {
    // Mock the user retrieval function to return an empty array
    jest
      .spyOn(require('../services/userService'), 'getAllUsers')
      .mockResolvedValueOnce([]);

    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('❌ erratic case: simulate server crash', async () => {
    // Mock to throw an error
    jest
      .spyOn(require('../services/userService'), 'getAllUsers')
      .mockImplementationOnce(() => {
        throw new Error('Server error');
      });

    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
