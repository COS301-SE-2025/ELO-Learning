import {
  calculateTimeReward,
  calculateLevelReward,
  calculateGateKeepingComponent,
  calculateSinglePlayerXP,
} from '../src/utils/xpCalculator';

describe('XP Calculator - Subfunction Tests', () => {
  describe('calculateTimeReward', () => {
    test('returns correct rewards for valid times', () => {
      expect(calculateTimeReward(0)).toBe(1);
      expect(calculateTimeReward(15)).toBeCloseTo(0.5);
      expect(calculateTimeReward(30)).toBe(0);
      expect(calculateTimeReward(3)).toBeCloseTo(0.9);
      expect(calculateTimeReward(28)).toBeCloseTo(0.067, 2);
    });

    test('returns 0 for invalid or out-of-bounds times', () => {
      expect(calculateTimeReward(-1)).toBe(0);
      expect(calculateTimeReward(1000)).toBe(0);
      expect(calculateTimeReward('bad')).toBe(0);
      expect(calculateTimeReward(null)).toBe(0);
    });
  });

  describe('calculateLevelReward', () => {
    test('returns scaled value for levels within bounds', () => {
      expect(calculateLevelReward(0)).toBeCloseTo(1);
      expect(calculateLevelReward(4)).toBeCloseTo(1 / (1 + 0.1 * 4));
      expect(calculateLevelReward(10)).toBeCloseTo(1 / (1 + 0.1 * 10));
    });

    test('returns 0 for invalid levels', () => {
      expect(calculateLevelReward(-1)).toBe(0);
      expect(calculateLevelReward(11)).toBe(0);
      expect(calculateLevelReward('bad')).toBe(0);
    });
  });

  describe('calculateGateKeepingComponent', () => {
    test('returns correct scaled value', () => {
      expect(calculateGateKeepingComponent(100, 200)).toBeCloseTo(0.05 * 0.5);
      expect(calculateGateKeepingComponent(0, 400)).toBeCloseTo(0.05);
      expect(calculateGateKeepingComponent(400, 400)).toBeCloseTo(0);
    });

    test('returns 0 for invalid or edge cases', () => {
      expect(calculateGateKeepingComponent(100, 0)).toBe(0);
      expect(calculateGateKeepingComponent(100, -100)).toBe(0);
      expect(calculateGateKeepingComponent(null, 400)).toBe(0);
      expect(calculateGateKeepingComponent(100, undefined)).toBe(0);
    });
  });
});

describe('XP Calculator - calculateSinglePlayerXP', () => {
  test('returns expected XP for valid data (basic case)', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 10,
      currentLevel: 2,
      currentXP: 100,
      nextLevelXP: 200,
    });

    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe('number');
  });

  test('returns 0 XP for incorrect answer (CA = 0)', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 0,
      XPGain: 20,
      actualTimeSeconds: 10,
      currentLevel: 2,
      currentXP: 100,
      nextLevelXP: 200,
    });

    expect(result).toBe(0);
  });

  test('handles invalid CA and XPGain gracefully', async () => {
    const result1 = await calculateSinglePlayerXP({
      CA: 'not-a-number',
      XPGain: 20,
      actualTimeSeconds: 10,
      currentLevel: 2,
      currentXP: 100,
      nextLevelXP: 200,
    });

    const result2 = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: -50,
      actualTimeSeconds: 10,
      currentLevel: 2,
      currentXP: 100,
      nextLevelXP: 200,
    });

    expect(result1).toBe(0);
    expect(result2).toBe(0);
  });

  test('handles edge cases in subcomponents gracefully', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 'invalid',
      currentLevel: 'invalid',
      currentXP: 'invalid',
      nextLevelXP: 'invalid',
    });

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).not.toBeNaN();
  });

  test('returns 0 XP if all inputs are bad', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 'bad',
      XPGain: 'bad',
      actualTimeSeconds: 'bad',
      currentLevel: 'bad',
      currentXP: 'bad',
      nextLevelXP: 'bad',
    });

    expect(result).toBe(0);
  });

  test('rounds XP to nearest integer and scales down', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 50,
      actualTimeSeconds: 5,
      currentLevel: 1,
      currentXP: 50,
      nextLevelXP: 100,
    });

    expect(result).toBe(Math.round(result)); // integer
    expect(result).toBeLessThan(50); // scaled down
  });
});
