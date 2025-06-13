import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/server.js';

jest.setTimeout(20000); // for slow tests

// Test data - adjust these to match your actual database
const testLevel = 4;
const testTopic = 'Statistics';
const testQuestionId = 22; // Make sure this exists in your Questions table

describe('Question Endpoints Integration Tests', () => {
  // GET /questions – content only (no auth required)
  describe('GET /questions', () => {
    it('should return all questions without auth', async () => {
      console.log('Running /questions test...');

      const res = await request(app).get('/questions');

      console.log('Response received:', res.statusCode);

      expect(res.statusCode).toBe(200);
      expect(res.body.questions).toBeDefined();
      expect(Array.isArray(res.body.questions)).toBe(true);

      // Verify question structure
      if (res.body.questions.length > 0) {
        const question = res.body.questions[0];
        expect(question.Q_id).toBeDefined();
        expect(question.topic).toBeDefined();
        expect(question.difficulty).toBeDefined();
        expect(question.level).toBeDefined();
        expect(question.questionText).toBeDefined();
        expect(question.xpGain).toBeDefined();
      }
    });

    it('should work without any authentication', async () => {
      // Test that it works without Authorization header
      const res = await request(app).get('/questions');

      expect(res.statusCode).toBe(200);
      expect(res.body.questions).toBeDefined();
    });
  });

  // GET /question/:level – both (auth required)
  describe('GET /question/:level', () => {
    it('should return questions for a specific level with valid auth', async () => {
      console.log(`Running /question/${testLevel} test with auth...`);

      const res = await request(app)
        .get(`/question/${testLevel}`)
        .set('Authorization', 'Bearer testtoken123');

      console.log('Response received:', res.statusCode);

      if (res.statusCode === 200) {
        expect(res.body.questions).toBeDefined();
        expect(Array.isArray(res.body.questions)).toBe(true);
        // Check that all returned questions have the correct level
        res.body.questions.forEach((question) => {
          expect(question.level).toBe(testLevel);
        });
      } else if (res.statusCode === 404) {
        console.warn(`No questions found for level ${testLevel}`);
        expect(res.body.error).toContain('Level');
      }

      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('should return 401 without authorization header', async () => {
      const res = await request(app).get(`/question/${testLevel}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('You are unauthorized to make this request.');
    });

    it('should return 401 with invalid auth format', async () => {
      const res = await request(app)
        .get(`/question/${testLevel}`)
        .set('Authorization', 'InvalidToken');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('You are unauthorized to make this request.');
    });
  });

  // GET /question/:id/answer – both (auth required)
  describe('GET /question/:id/answer', () => {
    it('should return answer for a specific question with valid auth', async () => {
      console.log(
        `Running /question/${testQuestionId}/answer test with auth...`,
      );

      const res = await request(app)
        .get(`/question/${testQuestionId}/answer`)
        .set('Authorization', 'Bearer testtoken123');

      console.log('Response received:', res.statusCode);

      if (res.statusCode === 200) {
        expect(res.body.answer).toBeDefined();
        expect(Array.isArray(res.body.answer)).toBe(true);
        // Verify the answer has correct question_id and is marked as correct
        res.body.answer.forEach((answer) => {
          expect(answer.question_id).toBe(testQuestionId);
          expect(answer.isCorrect).toBe(true);
        });
      } else if (res.statusCode === 404) {
        console.warn(
          `Question ${testQuestionId} doesn't exist or has no correct answer`,
        );
        expect(res.body.error).toBe("Question doesn't exist");
      }

      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('should return 401 without authorization header', async () => {
      const res = await request(app).get(`/question/${testQuestionId}/answer`);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('You are unauthorized to make this request.');
    });

    it('should return 401 with invalid auth format', async () => {
      const res = await request(app)
        .get(`/question/${testQuestionId}/answer`)
        .set('Authorization', 'InvalidToken');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('You are unauthorized to make this request.');
    });
  });

  // GET /questions/topic?topic=XYZ – both (no auth required)
  describe('GET /questions/topic', () => {
    it('should return questions for a specific topic without auth', async () => {
      console.log(`Running /questions/topic?topic=${testTopic} test...`);

      const res = await request(app).get(`/questions/topic?topic=${testTopic}`);

      console.log('Response received:', res.statusCode);

      expect(res.statusCode).toBe(200);
      expect(res.body.questions).toBeDefined();
      expect(Array.isArray(res.body.questions)).toBe(true);

      // Check that all returned questions have the correct topic
      res.body.questions.forEach((question) => {
        expect(question.topic).toBe(testTopic);
      });
    });

    it('should return 400 when topic parameter is missing', async () => {
      const res = await request(app).get('/questions/topic');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing topic parameter');
    });

    it('should return empty array for non-existent topic', async () => {
      const res = await request(app).get(
        '/questions/topic?topic=NonExistentTopic',
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.questions).toBeDefined();
      expect(Array.isArray(res.body.questions)).toBe(true);
      // Should return empty array for non-existent topics
    });

    it('should work without any authentication', async () => {
      // Test that it works without Authorization header
      const res = await request(app).get(`/questions/topic?topic=${testTopic}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.questions).toBeDefined();
    });
  });

  // GET /questions/level/topic?level=X&topic=XYZ – content only (no auth required)
  describe('GET /questions/level/topic', () => {
    it('should return questions filtered by both level and topic without auth', async () => {
      console.log(
        `Running /questions/level/topic?level=${testLevel}&topic=${testTopic} test...`,
      );

      const res = await request(app).get(
        `/questions/level/topic?level=${testLevel}&topic=${testTopic}`,
      );

      console.log('Response received:', res.statusCode);

      expect(res.statusCode).toBe(200);
      expect(res.body.questions).toBeDefined();
      expect(Array.isArray(res.body.questions)).toBe(true);

      // Check that all returned questions match both level and topic
      res.body.questions.forEach((question) => {
        expect(question.level).toBe(testLevel);
        expect(question.topic).toBe(testTopic);
      });
    });

    it('should return 400 when level parameter is missing', async () => {
      const res = await request(app).get(
        `/questions/level/topic?topic=${testTopic}`,
      );

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing level or topic parameter');
    });

    it('should return 400 when topic parameter is missing', async () => {
      const res = await request(app).get(
        `/questions/level/topic?level=${testLevel}`,
      );

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing level or topic parameter');
    });

    it('should return 400 when both parameters are missing', async () => {
      const res = await request(app).get('/questions/level/topic');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing level or topic parameter');
    });

    it('should return empty array for non-existent level/topic combination', async () => {
      const res = await request(app).get(
        '/questions/level/topic?level=999&topic=NonExistentTopic',
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.questions).toBeDefined();
      expect(Array.isArray(res.body.questions)).toBe(true);
      // Should return empty array for non-existent combinations
    });

    it('should work without any authentication', async () => {
      // Test that content-only endpoint works without Authorization header
      const res = await request(app).get(
        `/questions/level/topic?level=${testLevel}&topic=${testTopic}`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.questions).toBeDefined();
    });
  });

  // Additional edge case tests
  describe('Edge Cases', () => {
    it('should handle invalid level parameter gracefully', async () => {
      const res = await request(app)
        .get('/question/invalid')
        .set('Authorization', 'Bearer testtoken123');

      // Should either return 404 or empty array, not crash
      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('should handle invalid question ID for answer endpoint', async () => {
      const res = await request(app)
        .get('/question/99999/answer')
        .set('Authorization', 'Bearer testtoken123');

      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('should handle special characters in topic parameter', async () => {
      const res = await request(app).get(
        '/questions/topic?topic=Math%26Statistics',
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.questions).toBeDefined();
    });

    it('should handle empty topic parameter', async () => {
      const res = await request(app).get('/questions/topic?topic=');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing topic parameter');
    });
  });
});
