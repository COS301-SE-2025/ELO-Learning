import { calculateExpected, distributeXP } from '../src/multiPlayer.js';

describe('multiPlayer functions', () => {
  describe('calculateExpected', () => {
    test('returns expected probabilities summing to 1', () => {
      const [p1Exp, p2Exp] = calculateExpected(1000, 1200);
      expect(p1Exp + p2Exp).toBeCloseTo(1);
      expect(p1Exp).toBeGreaterThanOrEqual(0);
      expect(p1Exp).toBeLessThanOrEqual(1);
      expect(p2Exp).toBeGreaterThanOrEqual(0);
      expect(p2Exp).toBeLessThanOrEqual(1);
    });

    test('throws error on invalid inputs', () => {
      expect(() => calculateExpected('a', 1200)).toThrow(TypeError);
      expect(() => calculateExpected(1000, null)).toThrow(TypeError);
      expect(() => calculateExpected(NaN, 1200)).toThrow(TypeError);
      expect(() => calculateExpected(1000, undefined)).toThrow(TypeError);
      expect(() => calculateExpected({}, 1200)).toThrow(TypeError);
      expect(() => calculateExpected(1000, [])).toThrow(TypeError);
    });
  });

  describe('distributeXP', () => {
    test('distributes XP correctly for a win', () => {
      const [xp1, xp2] = distributeXP(100, 0.7, 0.3, 1);
      expect(xp1).toBeGreaterThan(xp2);
    });

    test('distributes XP correctly for a draw with similar ratings', () => {
      const [xp1, xp2] = distributeXP(100, 0.5, 0.5, 0.5);
      expect(xp1).toBeCloseTo(xp2);
    });

    test('throws error on invalid xpTotal', () => {
      expect(() => distributeXP(-10, 0.5, 0.5, 1)).toThrow(TypeError);
      expect(() => distributeXP('100', 0.5, 0.5, 1)).toThrow(TypeError);
      expect(() => distributeXP(NaN, 0.5, 0.5, 1)).toThrow(TypeError);
    });

    test('throws error on invalid expected1', () => {
      expect(() => distributeXP(100, -0.1, 0.5, 1)).toThrow(TypeError);
      expect(() => distributeXP(100, 1.1, 0.5, 1)).toThrow(TypeError);
      expect(() => distributeXP(100, 'foo', 0.5, 1)).toThrow(TypeError);
      expect(() => distributeXP(100, NaN, 0.5, 1)).toThrow(TypeError);
    });

    test('throws error on invalid expected2', () => {
      expect(() => distributeXP(100, 0.5, -0.1, 1)).toThrow(TypeError);
      expect(() => distributeXP(100, 0.5, 1.2, 1)).toThrow(TypeError);
      expect(() => distributeXP(100, 0.5, 'bar', 1)).toThrow(TypeError);
      expect(() => distributeXP(100, 0.5, NaN, 1)).toThrow(TypeError);
    });

    test('throws error on invalid score1', () => {
      expect(() => distributeXP(100, 0.5, 0.5, 0.4)).toThrow(TypeError);
      expect(() => distributeXP(100, 0.5, 0.5, 'win')).toThrow(TypeError);
      expect(() => distributeXP(100, 0.5, 0.5, null)).toThrow(TypeError);
      expect(() => distributeXP(100, 0.5, 0.5, undefined)).toThrow(TypeError);
    });

    test('handles edge cases where expected1 or expected2 is exactly 0 or 1', () => {
      // These are valid, but extreme edge cases
      const [xp1, xp2] = distributeXP(100, 0, 1, 1); // p1 had no chance but won
      expect(xp1).toBeGreaterThan(xp2);

      const [xp3, xp4] = distributeXP(100, 1, 0, 0); // p1 expected to win but lost
      expect(xp3).toBeLessThan(xp4);
    });
  });
});
