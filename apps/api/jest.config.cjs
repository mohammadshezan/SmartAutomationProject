module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {},
  moduleFileExtensions: ['js','mjs','cjs','json'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/setupEnv.js']
};