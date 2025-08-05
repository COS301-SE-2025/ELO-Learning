import {
  calculateTimeReward,
  calculateLevelReward,
  calculateGateKeepingComponent,
  calculateSinglePlayerXP,
} from '../src/singlePlayer.js';

describe('singlePlayer XP calculations', () => {
  test('calculateTimeReward returns correct reward', () => {
    expect(calculateTimeReward(0)).toBe(1); //Maximum time reward
    expect(calculateTimeReward(15)).toBe(0.5); //Half of maximum time
    expect(calculateTimeReward(30)).toBe(0);
    expect(calculateTimeReward(3)).toBeCloseTo(0.9);
    expect(calculateTimeReward(28)).toBeCloseTo(0.067, 3);
    expect(calculateTimeReward(2000)).toBe(0); // capped at 0

    //invalid time should return no reward:
    expect(calculateTimeReward(-421)).toBe(0); //negative testing
  });

  test('CalculateLevelReward scales correctly', () => {
    expect(calculateLevelReward(0)).toBeCloseTo(1);
    expect(calculateLevelReward(4)).toBeCloseTo(1 / (1 + 0.1 * 4));
    expect(calculateLevelReward(10)).toBeCloseTo(1 / (1 + 0.1 * 10));

    //invalid levels should give no rewards:
    expect(calculateLevelReward(-1)).toBe(0);
    expect(calculateLevelReward(11)).toBe(0);
  });

  test('calculateGateKeepingComponent works as expected', () => {
    expect(calculateGateKeepingComponent(200, 400)).toBeCloseTo(
      0.05 * (200 / 400),
    );
    expect(calculateGateKeepingComponent(0, 400)).toBeCloseTo(0.05);
    expect(calculateGateKeepingComponent(400, 400)).toBeCloseTo(0);

    //Comparison: user closer vs further from next level
    const closer = calculateGateKeepingComponent(350, 400); // closer to next level
    const further = calculateGateKeepingComponent(100, 400); // further from next level
    expect(closer).toBeLessThan(further);
  });

  test('calculateSinglePlayerXP integrates components', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });

    expect(result).toBeGreaterThan(0);
    expect(result).not.toBeNaN();
  });

  test('calculateSinglePlayerXP gives 0 XP if incorrect answer', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 0,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });

    expect(result).toBe(0);
  });

  test('calculateSinglePlayerXP handles negative actualTimeSeconds gracefully', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: -10,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });

    expect(result).toBeGreaterThan(0);
    expect(result).not.toBeNaN();
  });

  test('calculateSinglePlayerXP handles negative currentLevel gracefully', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: -5,
      currentXP: 200,
      nextLevelXP: 400,
    });

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).not.toBeNaN();
  });

  test('calculateSinglePlayerXP handles currentXP greater than nextLevelXP', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 500, // higher than nextLevelXP
      nextLevelXP: 400,
    });

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).not.toBeNaN();
  });

  test('calculateSinglePlayerXP handles negative XPGain', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: -20, // negative base XP
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });

    // Expect XP clamped to 0
    expect(result).toBe(0);
  });

  test('calculateSinglePlayerXP handles invalid CA and XPGain gracefully', async () => {
    const result1 = await calculateSinglePlayerXP({
      CA: 'invalid', // not a number
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });

    const result2 = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 'invalid', // not a number
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });

    const result3 = await calculateSinglePlayerXP({
      CA: NaN,
      XPGain: NaN,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });

    expect(result1).toBe(0);
    expect(result2).toBe(0);
    expect(result3).toBe(0);
  });

  test('calculateSinglePlayerXP handles invalid nextLevelXP gracefully', async () => {
    const result1 = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 0, // invalid, division by zero risk
    });

    const result2 = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: -100, // invalid, negative XP goal
    });

    expect(result1).toBeGreaterThanOrEqual(0);
    expect(result1).not.toBeNaN();
    expect(result2).toBeGreaterThanOrEqual(0);
    expect(result2).not.toBeNaN();
  });

  test('calculateSinglePlayerXP computes other components of XP even if actualTimeSeconds is invalid', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 'invalid',
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });
    expect(result).toBeGreaterThan(0);
    expect(result).not.toBeNaN();
  });

  test('calculateSinglePlayerXP computes other components of XP even if currentLevel is invalid', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 'invalid',
      currentXP: 200,
      nextLevelXP: 400,
    });
    expect(result).toBeGreaterThan(0);
    expect(result).not.toBeNaN();
  });

  test('calculateSinglePlayerXP computes other components of XP even if currentXP is invalid', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 'invalid',
      nextLevelXP: 400,
    });
    expect(result).toBeGreaterThan(0);
    expect(result).not.toBeNaN();
  });

  test('calculateSinglePlayerXP computes other components of XP even if nextLevelXP is invalid', async () => {
    const result = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 'invalid',
    });
    expect(result).toBeGreaterThan(0);
    expect(result).not.toBeNaN();
  });

  test('calculateTimeReward handles invalid input types gracefully', () => {
    expect(calculateTimeReward('string')).toBe(0);
    expect(calculateTimeReward(null)).toBe(0);
    expect(calculateTimeReward(undefined)).toBe(0);
    expect(calculateTimeReward({})).toBe(0);
    expect(calculateTimeReward([])).toBe(0);
  });

  test('calculateLevelReward handles invalid input types gracefully', () => {
    expect(calculateLevelReward('string')).toBe(0);
    expect(calculateLevelReward(null)).toBe(0);
    expect(calculateLevelReward(undefined)).toBe(0);
    expect(calculateLevelReward({})).toBe(0);
    expect(calculateLevelReward([])).toBe(0);
  });

  test('calculateGateKeepingComponent handles invalid input types gracefully', () => {
    expect(calculateGateKeepingComponent('100', 400)).toBe(0);
    expect(calculateGateKeepingComponent(100, '400')).toBe(0);
    expect(calculateGateKeepingComponent(null, 400)).toBe(0);
    expect(calculateGateKeepingComponent(100, null)).toBe(0);
    expect(calculateGateKeepingComponent(undefined, 400)).toBe(0);
    expect(calculateGateKeepingComponent(100, undefined)).toBe(0);
    expect(calculateGateKeepingComponent({}, 400)).toBe(0);
    expect(calculateGateKeepingComponent(100, [])).toBe(0);
  });

  test('calculateSinglePlayerXP handles invalid param types gracefully', async () => {
    const result1 = await calculateSinglePlayerXP({
      CA: 'string',
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });
    expect(result1).toBe(0);

    const result2 = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 'string',
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });
    expect(result2).toBe(0);

    const result3 = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 'string',
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 400,
    });
    expect(result3).toBeGreaterThanOrEqual(0);

    const result4 = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 'string',
      currentXP: 200,
      nextLevelXP: 400,
    });
    expect(result4).toBeGreaterThanOrEqual(0);

    const result5 = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 'string',
      nextLevelXP: 400,
    });
    expect(result5).toBeGreaterThanOrEqual(0);

    const result6 = await calculateSinglePlayerXP({
      CA: 1,
      XPGain: 20,
      actualTimeSeconds: 15,
      currentLevel: 4,
      currentXP: 200,
      nextLevelXP: 'string',
    });
    expect(result6).toBeGreaterThanOrEqual(0);
  });
});
