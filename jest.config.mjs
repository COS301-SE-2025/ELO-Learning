export default {
  roots: ['<rootDir>/backend', '<rootDir>/frontend', '<rootDir>/tests'],
  testMatch: [
    '**/test/**/*.test.mjs',
    '**/test/**/*.test.js',
    '**/*.test.js',
    '**/*.test.mjs',
  ],
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
};
