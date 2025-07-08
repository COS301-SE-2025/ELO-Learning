// application/elo-learning/services/__tests__/singlePlayer.test.ts
import {
  calculateTimeReward,
  calculateLevelReward,
  calculateGateKeepingComponent,
  calculateSinglePlayerXP,
} from '../singlePlayer';

describe('SinglePlayer Service', () => {
  describe('calculateTimeReward', () => {
    it('should return maximum reward when time is 0', () => {
      const result = calculateTimeReward(0);
      expect(result).toBe(1);
    });

    it('should return 0 reward when time equals maxTimeSeconds', () => {
      const result = calculateTimeReward(30);
      expect(result).toBe(0);
    });

    it('should return 0.5 reward when time is half of maxTimeSeconds', () => {
      const result = calculateTimeReward(15);
      expect(result).toBe(0.5);
    });

    it('should return 0 for negative time', () => {
      const result = calculateTimeReward(-5);
      expect(result).toBe(0);
    });

    it('should return 0 for time exceeding maxTimeSeconds', () => {
      const result = calculateTimeReward(35);
      expect(result).toBe(0);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateTimeReward(NaN)).toBe(0);
      expect(calculateTimeReward(undefined as any)).toBe(0);
      expect(calculateTimeReward('invalid' as any)).toBe(0);
    });
  });

  describe('calculateLevelReward', () => {
    it('should return 1 for level 0', () => {
      const result = calculateLevelReward(0);
      expect(result).toBe(1);
    });

    it('should decrease reward as level increases', () => {
      const level1Reward = calculateLevelReward(1);
      const level2Reward = calculateLevelReward(2);
      expect(level1Reward).toBeGreaterThan(level2Reward);
    });

    it('should return approximately 0.952 for level 1 (1/(1+0.05*1))', () => {
      const result = calculateLevelReward(1);
      expect(result).toBeCloseTo(0.952, 3);
    });

    it('should return 0 for negative levels', () => {
      const result = calculateLevelReward(-1);
      expect(result).toBe(0);
    });

    it('should return 0 for levels above maximum', () => {
      const result = calculateLevelReward(11);
      expect(result).toBe(0);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateLevelReward(NaN)).toBe(0);
      expect(calculateLevelReward(undefined as any)).toBe(0);
      expect(calculateLevelReward('invalid' as any)).toBe(0);
    });
  });

  describe('calculateGateKeepingComponent', () => {
    it('should return correct gatekeeping value when currentXP < nextLevelXP', () => {
      const result = calculateGateKeepingComponent(50, 100);
      // remainingXP = 100 - 50 = 50
      // gatekeeping = 0.3 * (50/100) = 0.15
      expect(result).toBe(0.15);
    });

    it('should return 0 when currentXP equals nextLevelXP', () => {
      const result = calculateGateKeepingComponent(100, 100);
      expect(result).toBe(0);
    });

    it('should handle case when currentXP > nextLevelXP', () => {
      const result = calculateGateKeepingComponent(150, 100);
      // remainingXP = 100 - 150 = -50
      // gatekeeping = 0.3 * (-50/100) = -0.15
      expect(result).toBe(-0.15);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateGateKeepingComponent(NaN, 100)).toBe(0);
      expect(calculateGateKeepingComponent(50, NaN)).toBe(0);
      expect(calculateGateKeepingComponent(50, 0)).toBe(0);
      expect(calculateGateKeepingComponent(50, -10)).toBe(0);
    });
  });

  describe('calculateSinglePlayerXP', () => {
    const defaultParams = {
      CA: 1, // Correct answer
      XPGain: 100,
      actualTimeSeconds: 15,
      currentLevel: 1,
      currentXP: 50,
      nextLevelXP: 100,
    };

    it('should calculate XP correctly for a perfect answer', async () => {
      const result = await calculateSinglePlayerXP(defaultParams);

      // Expected calculation:
      // timeReward = (30-15)/30 = 0.5
      // levelReward = 1/(1+0.05*1) = 0.952
      // gatekeeper = 0.3 * (50/100) = 0.15
      // XP = 1 * (100*1 + 100*0.5 + 100*0.952 + 100*0.15)
      //    = 1 * (100 + 50 + 95.2 + 15) = 260.2

      expect(result).toBeCloseTo(260.2, 1);
    });

    it('should return 0 XP for incorrect answer', async () => {
      const params = { ...defaultParams, CA: 0 };
      const result = await calculateSinglePlayerXP(params);
      expect(result).toBe(0);
    });

    it('should handle partial correct answers', async () => {
      const params = { ...defaultParams, CA: 0.5 };
      const result = await calculateSinglePlayerXP(params);

      // With CA = 0.5, the formula becomes:
      // XP = 0.5 * (100*0.5 + 100*0.5 + 100*0.952 + 100*0.15)
      //    = 0.5 * (50 + 50 + 95.2 + 15) = 0.5 * 210.2 = 105.1

      expect(result).toBeCloseTo(105.1, 1);
    });

    it('should handle invalid CA values by treating as 0', async () => {
      const params = { ...defaultParams, CA: -0.5 };
      const result = await calculateSinglePlayerXP(params);
      expect(result).toBe(0);
    });

    it('should handle invalid XPGain values by treating as 0', async () => {
      const params = { ...defaultParams, XPGain: -50 };
      const result = await calculateSinglePlayerXP(params);
      expect(result).toBe(0);
    });

    it('should never return negative XP', async () => {
      const params = {
        ...defaultParams,
        CA: 1,
        XPGain: -100, // This should be treated as 0
      };
      const result = await calculateSinglePlayerXP(params);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should handle edge case with maximum time', async () => {
      const params = { ...defaultParams, actualTimeSeconds: 30 };
      const result = await calculateSinglePlayerXP(params);

      // timeReward = 0, so the time component should be 0
      const expectedWithoutTime =
        1 * (100 * 1 + 0 + 100 * (1 / (1 + 0.05 * 1)) + 100 * 0.15);
      expect(result).toBeCloseTo(expectedWithoutTime, 1);
    });

    it('should handle floating point precision correctly', async () => {
      const result = await calculateSinglePlayerXP(defaultParams);
      // Result should be rounded to 2 decimal places
      expect(Number.isInteger(result * 100)).toBe(true);
    });
  });
});
