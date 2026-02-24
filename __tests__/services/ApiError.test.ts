/**
 * ApiError 类测试
 * 
 * 覆盖:
 * - 正确的 Error 继承
 * - 属性赋值
 * - instanceof 判断
 * - message 格式
 */

// Mock 原生依赖（ApiError 通过 recruitment-api → security → expo-secure-store）
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(),
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));
jest.mock('axios', () => {
  const m: any = { create: jest.fn(() => m), interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }, get: jest.fn(), post: jest.fn() };
  return { __esModule: true, default: m, ...m };
});

import { ApiError } from '../../services/recruitment-api';

describe('ApiError', () => {
  it('should be an instance of Error', () => {
    const err = new ApiError(404, 'Not Found');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it('should have correct name', () => {
    const err = new ApiError(500, 'Internal Server Error');
    expect(err.name).toBe('ApiError');
  });

  it('should format message with status code', () => {
    const err = new ApiError(403, 'Forbidden');
    expect(err.message).toBe('API Error 403: Forbidden');
  });

  it('should store status and statusText', () => {
    const err = new ApiError(422, 'Unprocessable Entity');
    expect(err.status).toBe(422);
    expect(err.statusText).toBe('Unprocessable Entity');
  });

  it('should store response body when provided', () => {
    const body = { error: 'validation_failed', details: ['name is required'] };
    const err = new ApiError(400, 'Bad Request', body);
    expect(err.body).toEqual(body);
  });

  it('should work with optional body', () => {
    const err = new ApiError(500, 'Server Error');
    expect(err.body).toBeUndefined();
  });

  it('should be catchable in try-catch', () => {
    try {
      throw new ApiError(401, 'Unauthorized');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      if (e instanceof ApiError) {
        expect(e.status).toBe(401);
      }
    }
  });

  it('should have a stack trace', () => {
    const err = new ApiError(500, 'ISE');
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain('ApiError');
  });
});
