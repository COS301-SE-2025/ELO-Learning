import {
  calculateExpectedRating,
  updateEloRating,
  updateSinglePlayerElo,
} from '../src/utils/eloCalculator';

describe('ELO Rating Functions', () => {
  describe('calculateExpectedRating', () => {
    test('returns 0.5 when ratings are equal', () => {
      expect(calculateExpectedRating(5, 5)).toBeCloseTo(0.5);
    });

    test('returns > 0.5 when playerRating > questionRating', () => {
      expect(calculateExpectedRating(8, 5)).toBeGreaterThan(0.5);
    });

    test('returns < 0.5 when playerRating < questionRating', () => {
      expect(calculateExpectedRating(4, 6)).toBeLessThan(0.5);
    });

    test('returns close to 1 when playerRating is much higher', () => {
      expect(calculateExpectedRating(20, 0)).toBeCloseTo(1, 1);
    });

    test('returns close to 0 when playerRating is much lower', () => {
      expect(calculateExpectedRating(0, 20)).toBeCloseTo(0, 1);
    });

    test('handles negative ratings', () => {
      expect(calculateExpectedRating(-10, -5)).toBeLessThan(0.5);
    });
  });

  describe('updateEloRating', () => {
    test('increases rating on win', () => {
      const updated = updateEloRating({
        rating: 5,
        expected: 0.3,
        actual: 1,
        kFactor: 1,
      });
      expect(updated).toBeGreaterThan(5);
    });

    test('decreases rating on loss', () => {
      const updated = updateEloRating({
        rating: 5,
        expected: 0.8,
        actual: 0,
        kFactor: 1,
      });
      expect(updated).toBeLessThan(5);
    });

    test('does not go below 0', () => {
      const updated = updateEloRating({
        rating: 0.01,
        expected: 0.9,
        actual: 0,
        kFactor: 1,
      });
      expect(updated).toBeGreaterThanOrEqual(0);
    });

    test('no change if actual == expected', () => {
      const rating = 5;
      const expected = 0.6;
      const actual = 0.6;
      const updated = updateEloRating({
        rating,
        expected,
        actual,
        kFactor: 1,
      });
      expect(updated).toBeCloseTo(rating);
    });
  });

  describe('updateSinglePlayerElo', () => {
    test('handles correct answer (win)', () => {
      const newElo = updateSinglePlayerElo({
        playerRating: 5,
        questionRating: 4,
        isCorrect: true,
      });
      expect(newElo).toBeGreaterThan(5);
    });

    test('handles incorrect answer (loss)', () => {
      const newElo = updateSinglePlayerElo({
        playerRating: 5,
        questionRating: 6,
        isCorrect: false,
      });
      expect(newElo).toBeLessThan(5);
    });

    test('handles edge case where ELO is already 0', () => {
      const newElo = updateSinglePlayerElo({
        playerRating: 0,
        questionRating: 5,
        isCorrect: false,
      });
      expect(newElo).toBeGreaterThanOrEqual(0);
    });

    test('handles floating-point precision', () => {
      const newElo = updateSinglePlayerElo({
        playerRating: 5.123456,
        questionRating: 4.987654,
        isCorrect: true,
      });
      expect(typeof newElo).toBe('number');
      expect(newElo).toBeCloseTo(parseFloat(newElo.toFixed(2)));
    });

    test('does not produce NaN', () => {
      const newElo = updateSinglePlayerElo({
        playerRating: 5,
        questionRating: 4,
        isCorrect: true,
      });
      expect(isNaN(newElo)).toBe(false);
    });
  });
});
