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
            diagnostics: false,
        }],
    },
    // @alpha: Expo 包使用 ESM 语法，需要被 ts-jest 转换
    transformIgnorePatterns: [
        'node_modules/(?!(expo-device|expo-modules-core|@expo/.*)/)',
    ],
    moduleNameMapper: {
        '^react-native$': '<rootDir>/__tests__/__mocks__/react-native.js',
        '^@/(.*)$': '<rootDir>/$1',
        // @alpha: mock 缺失的测试依赖库
        '^@testing-library/react-hooks$': '<rootDir>/__tests__/__mocks__/testing-library-react-hooks.js',
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

