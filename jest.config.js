/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    globals: {
        __DEV__: true,
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
        }],
    },
    moduleNameMapper: {
        '^react-native$': '<rootDir>/__tests__/__mocks__/react-native.js',
        '^@/(.*)$': '<rootDir>/$1',
    },
    collectCoverageFrom: [
        'utils/**/*.ts',
        'hooks/**/*.ts',
        'components/**/*.ts',
        'components/**/*.tsx',
        'services/**/*.ts',
        'config/**/*.ts',
        '!**/*.d.ts',
        '!**/node_modules/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testPathIgnorePatterns: ['/node_modules/', '/\\.expo/'],
    setupFiles: ['<rootDir>/__tests__/setup.ts'],
    verbose: true,
};

