export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/unit/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'services/**/*.ts',
    'components/**/*.ts',
    'components/**/*.tsx',
    '!components/**/*.stories.tsx',
    '!**/node_modules/**',
    '!**/tests/e2e/**'
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  roots: ['<rootDir>/tests/unit'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true
    }],
  },
  extensionsToTreatAsEsm: ['.ts'],
};