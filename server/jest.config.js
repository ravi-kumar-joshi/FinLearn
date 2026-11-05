// server/jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverage: false,
  clearMocks: true,
  setupFiles: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 15000,
  verbose: true,
};
