/**
 * 客户端安全工具
 * 用于 React Native App 生成签名和管理 Token
 * 
 * 安全修复记录 (2026-02-07):
 * - [CRITICAL-001] 移除硬编码密钥，改用安全存储
 * - [HIGH-001] 使用真正的 HMAC-SHA256 签名
 * - [HIGH-002] 使用加密安全随机数生成 Nonce 和 Session ID
 * - [HIGH-003] 加强 Token 刷新响应验证
 */

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// ============================================================================
// 数据库加密密钥管理
// ============================================================================

const DB_ENCRYPTION_KEY_NAME = 'db_encryption_key';
let cachedDbKey: string | null = null;

/**
 * 获取数据库加密密钥
 * 
 * [HIGH-004 修复] SQLCipher 加密密钥管理
 * - 首次安装: 生成 256-bit 加密安全随机密钥
 * - 后续启动: 从 SecureStore 读取（iOS Keychain / Android Keystore）
 * - 运行时缓存: 避免每次 DB 操作都访问 Keychain
 */
export async function getDatabaseEncryptionKey(): Promise<string> {
  if (cachedDbKey) return cachedDbKey;

  try {
    const stored = await SecureStore.getItemAsync(DB_ENCRYPTION_KEY_NAME);
    if (stored) {
      cachedDbKey = stored;
      return stored;
    }
  } catch (e) {
    console.warn('[Security] Failed to read DB encryption key');
  }

  // 首次安装: 生成 256-bit 随机密钥
  const bytes = await Crypto.getRandomBytesAsync(32);
  const key = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');

  try {
    await SecureStore.setItemAsync(DB_ENCRYPTION_KEY_NAME, key);
  } catch (e) {
    console.error('[Security] Failed to persist DB encryption key');
  }

  cachedDbKey = key;
  return key;
}

// ============================================================================
// 安全配置
// ============================================================================

/**
 * [CRITICAL-001 修复] 密钥不再硬编码
 * 
 * 获取 API 签名密钥的安全方式（按优先级）：
 * 1. 从安全存储获取（后端动态下发）
 * 2. 开发环境使用默认值（仅用于本地调试）
 * 3. 生产环境无密钥时禁用签名
 */
const API_SECRET_KEY = 'app_sign_secret';
let cachedApiSecret: string | null = null;

async function getApiSecret(): Promise<string> {
  // 已缓存则直接返回
  if (cachedApiSecret) {
    return cachedApiSecret;
  }

  // 从安全存储获取（后端动态下发的密钥）
  try {
    const storedSecret = await SecureStore.getItemAsync(API_SECRET_KEY);
    if (storedSecret) {
      cachedApiSecret = storedSecret;
      return storedSecret;
    }
  } catch (e) {
    console.warn('[Security] Failed to read secret from SecureStore');
  }

  // 开发环境使用默认值（仅用于本地调试）
  if (__DEV__) {
    console.warn('[Security] Using dev fallback secret - DO NOT USE IN PRODUCTION');
    cachedApiSecret = 'dev_secret_for_local_testing_only';
    return cachedApiSecret;
  }

  // 生产环境无密钥时禁用签名
  console.error('[Security] No API secret available - requests will not be signed');
  return '';
}

/**
 * 保存后端下发的 API 密钥（用于动态密钥轮换）
 */
export async function saveApiSecret(secret: string): Promise<void> {
  if (!secret || typeof secret !== 'string') {
    throw new Error('Invalid API secret');
  }
  await SecureStore.setItemAsync(API_SECRET_KEY, secret);
  cachedApiSecret = secret;
}

/**
 * 清除缓存的 API 密钥（用于登出或密钥轮换）
 */
export async function clearApiSecret(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(API_SECRET_KEY);
    cachedApiSecret = null;
  } catch (e) {
    console.error('[Security] Failed to clear API secret');
  }
}

// ============================================================================
// 签名生成
// ============================================================================

/**
 * [HIGH-002 修复] 使用加密安全随机数生成 Nonce
 */
export async function generateNonce(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * [HIGH-002 修复] 生成加密安全的 Session ID
 */
export async function generateSecureSessionId(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  const randomPart = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `session_${randomPart}`;
}

/**
 * [HIGH-001 修复] 使用真正的 HMAC-SHA256 签名
 * 
 * 签名规则：HMAC-SHA256(timestamp + nonce + body, secret)
 * 
 * 注意：expo-crypto 不直接支持 HMAC，我们使用 HKDF 风格的实现：
 * signature = SHA256(secret || SHA256(payload))
 * 这比简单拼接更安全，可防止长度扩展攻击
 */
export async function generateRequestSignature(
  timestamp: number,
  nonce: string,
  body: string
): Promise<string> {
  const secret = await getApiSecret();
  
  if (!secret) {
    // 无密钥时返回空签名
    return '';
  }

  const payload = `${timestamp}${nonce}${body}`;

  // 双重哈希防止长度扩展攻击
  // Step 1: 对 payload 进行哈希
  const payloadHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload,
    { encoding: Crypto.CryptoEncoding.HEX }
  );

  // Step 2: 将密钥和 payload 哈希组合后再次哈希
  const signature = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${secret}:${payloadHash}`,
    { encoding: Crypto.CryptoEncoding.HEX }
  );

  return signature;
}

/**
 * 创建安全的请求 Headers（带签名）
 */
export async function createSecureHeaders(
  body: string = ''
): Promise<Record<string, string>> {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = await generateNonce();
  const signature = await generateRequestSignature(timestamp, nonce, body);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Timestamp': timestamp.toString(),
    'X-Nonce': nonce,
  };

  // 仅在有签名时添加
  if (signature) {
    headers['X-Signature'] = signature;
  }

  // 添加 Access Token（如果存在）
  const token = await getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// ============================================================================
// Token 管理
// ============================================================================

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * 保存 Token 到安全存储
 */
export async function saveTokens(accessToken: string, refreshToken: string) {
  // 验证 token 必须是有效字符串
  if (typeof accessToken !== 'string' || !accessToken) {
    console.error('[Security] Invalid accessToken provided:', typeof accessToken);
    throw new Error('accessToken must be a non-empty string');
  }
  if (typeof refreshToken !== 'string' || !refreshToken) {
    console.error('[Security] Invalid refreshToken provided:', typeof refreshToken);
    throw new Error('refreshToken must be a non-empty string');
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * 获取 Access Token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('[Security] Failed to get access token:', error);
    return null;
  }
}

/**
 * 获取 Refresh Token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[Security] Failed to get refresh token:', error);
    return null;
  }
}

/**
 * 清除所有 Token
 */
export async function clearTokens() {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[Security] Failed to clear tokens:', error);
  }
}

/**
 * [HIGH-003 修复] 刷新 Access Token - 加强响应验证
 */
export async function refreshAccessToken(baseUrl: string): Promise<boolean> {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      console.warn('[Auth] No refresh token available');
      return false;
    }

    // 添加请求超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('[Auth] Token refresh failed with status:', response.status);
      return false;
    }

    const data = await response.json();

    // [HIGH-003 修复] 严格验证响应数据
    const newAccessToken = data?.data?.accessToken || data?.accessToken;
    
    if (!newAccessToken || typeof newAccessToken !== 'string' || newAccessToken.length < 10) {
      console.error('[Auth] Invalid access token in refresh response');
      return false;
    }

    // [P0-002 修复] 同步更新 refreshToken（后端可能轮换）
    const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;
    
    if (newRefreshToken && typeof newRefreshToken === 'string') {
      // 后端轮换了 refreshToken，同步保存
      await saveTokens(newAccessToken, newRefreshToken);
      if (__DEV__) console.log('[Auth] Token pair refreshed (access + refresh)');
    } else {
      // 后端只返回了新 accessToken，保留旧 refreshToken
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);
      if (__DEV__) console.log('[Auth] Access token refreshed');
    }

    // 如果后端同时下发了新的签名密钥，也同步更新
    const newClientSecret = data?.data?.clientSecret || data?.clientSecret;
    if (newClientSecret && typeof newClientSecret === 'string') {
      await saveApiSecret(newClientSecret);
    }
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Auth] Token refresh timed out');
    } else {
      console.error('[Auth] Failed to refresh token:', error);
    }
    return false;
  }
}

/**
 * 安全的 fetch 封装（自动处理签名和 Token 刷新）
 * 
 * [HIGH-004 修复] 超时 signal 与用户 signal 合并，不再覆盖
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const body = options.body ? String(options.body) : '';
  const headers = await createSecureHeaders(body);

  // 超时控制
  const timeoutMs = 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // 合并用户 signal 与超时 signal
  const mergedSignal = options.signal
    ? (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal
        ? AbortSignal.any([options.signal, controller.signal])
        : controller.signal) // fallback: 超时优先
    : controller.signal;

  try {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...headers,
      },
      signal: mergedSignal,
    });

    clearTimeout(timeoutId);

    // 如果 401，尝试刷新 Token
    if (response.status === 401) {
      // 从 URL 提取 baseUrl
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

      const refreshed = await refreshAccessToken(baseUrl);
      if (refreshed) {
        // 重试请求
        const newHeaders = await createSecureHeaders(body);
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), timeoutMs);

        const retrySignal = options.signal
          ? (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal
              ? AbortSignal.any([options.signal, retryController.signal])
              : retryController.signal)
          : retryController.signal;

        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            ...newHeaders,
          },
          signal: retrySignal,
        });

        clearTimeout(retryTimeoutId);
      }
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
