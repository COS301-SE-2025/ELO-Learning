/**
 * Simple validation test to ensure Jest setup is working
 */

describe('Test Setup Validation', () => {
  it('should have Jest configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should have access to test utilities', () => {
    expect(global.testUtils).toBeDefined();
    expect(global.testUtils.createMockAchievement).toBeDefined();
    expect(global.testUtils.createMockUser).toBeDefined();
    expect(global.testUtils.createMockQuestion).toBeDefined();
  });

  it('should be able to create mock achievement', () => {
    const achievement = global.testUtils.createMockAchievement({
      name: 'Test Achievement',
    });

    expect(achievement).toHaveProperty('name', 'Test Achievement');
    expect(achievement).toHaveProperty('id');
    expect(achievement).toHaveProperty('description');
  });

  it('should have proper environment setup', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
