// tests/answer.test.js
const request = require('supertest');
const app = require('../app');

describe('POST /question/22/answer', () => {
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

    expect(res.statusCode).toBe(400); // Or whatever your app returns
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
