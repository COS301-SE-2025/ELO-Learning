import request from 'supertest';
import app from '../../backend/src/server.js';

afterEach(() => {
  jest.restoreAllMocks(); // cleanup mocks between tests
});

describe('📌 POST /question/22/answer', () => {
  const token = 'Bearer testtoken123'; // simulate a valid token

  test('✅ should successfully post a valid answer', async () => {
    const res = await request(app)
      .post('/question/22/answer')
      .set('Authorization', token)
      .send({
        question: [
          {
            answer: 'The spread of the data from the mean',
          },
        ],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ result: true });
  });

  test('⚠️ edge case: empty answer array', async () => {
    const res = await request(app)
      .post('/question/22/answer')
      .set('Authorization', token)
      .send({ question: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('❌ erratic case: malformed body, no "question" field', async () => {
    const res = await request(app)
      .post('/question/22/answer')
      .set('Authorization', token)
      .send({ response: 'wrong key' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('📌 GET /users', () => {
  test('✅ should return list of users successfully', async () => {
    const res = await request(app).get('/users');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('username');
  });

  test('⚠️ edge case: should handle no users in the system', async () => {
    jest
      .spyOn(require('../services/userService'), 'getAllUsers')
      .mockResolvedValueOnce([]);

    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('❌ erratic case: simulate server crash', async () => {
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
