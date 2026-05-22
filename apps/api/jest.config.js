module.exports = {
  displayName: '@aseanflow/api',
  testEnvironment: 'node',
  preset: 'ts-jest',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@aseanflow/database$': '<rootDir>/../test/mocks/database.ts',
    '^@prisma/client/runtime/library$': '<rootDir>/../test/mocks/prisma-decimal.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
};