/**
 * Jest 全局 Mock Setup
 * 
 * Mock 掉 React Native 和 Expo 原生模块，
 * 使纯逻辑单元测试可以在 Node 环境中运行。
 */

// ── React Native ──
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: (opts: any) => opts.ios ?? opts.default },
  Dimensions: { get: () => ({ width: 390, height: 844 }) },
  StyleSheet: { create: (s: any) => s },
  Linking: { canOpenURL: jest.fn().mockResolvedValue(false) },
}));

// ── Expo Modules ──
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn().mockResolvedValue(new Uint8Array(32)),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn().mockResolvedValue('mocked-hash'),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
  }),
}));

// ── Axios ──
jest.mock('axios', () => {
  const mockAxios: any = {
    create: jest.fn(() => mockAxios),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
  };
  return {
    __esModule: true,
    default: mockAxios,
    ...mockAxios,
  };
});
