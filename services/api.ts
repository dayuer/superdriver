/**
 * API 服务
 * 
 * 安全修复记录 (2026-02-07):
 * - [CRITICAL-002] 开发登录逻辑严格限制在 __DEV__ 环境
 * - [HIGH-002] 使用加密安全随机数生成 Session ID
 * - [MEDIUM-003] 添加请求超时控制
 */

import axios, { InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { 
  getAccessToken, 
  refreshAccessToken, 
  clearTokens, 
  saveTokens, 
  createSecureHeaders,
  generateSecureSessionId 
} from '../lib/security';

// ============================================================================
// 智能 BASE_URL 解析
// ============================================================================

/**
 * 🔴 生产环境 API 地址
 * 部署后替换为真实域名，必须使用 HTTPS
 */
const PRODUCTION_API = 'https://api.superdriver.app';

/**
 * 开发环境后端端口
 */
const DEV_API_PORT = 3000;

/**
 * 从 React Native DevServer 提取宿主机 IP
 * 
 * 原理：Expo/Metro 在开发模式下会将宿主机的局域网 IP 注入到
 * `global.__expo_dev_server_url__` 或 RN 的 scriptURL 中。
 * 当用真机扫码调试时，手机和电脑必须在同一局域网，
 * 此时 DevServer URL 中的 IP 就是宿主机的局域网 IP。
 */
/**
 * 开发环境宿主机 LAN IP (硬编码兜底)
 * 当所有自动检测方法都失败时使用
 * 更新方法: ifconfig | grep "inet " | grep -v 127.0.0.1
 */
const DEV_LAN_IP_FALLBACK = '192.168.3.129';

function getDevServerHost(): string {
  try {
    // 方法 1: Expo Constants (expo-dev-client 最可靠)
    try {
      const Constants = require('expo-constants').default;
      const debuggerHost = Constants?.expoConfig?.hostUri || Constants?.manifest2?.extra?.expoGo?.debuggerHost || Constants?.manifest?.debuggerHost;
      if (debuggerHost) {
        const host = debuggerHost.split(':')[0];
        if (host && host !== 'localhost' && host !== '127.0.0.1') {
          console.log(`[API] Host from Constants: ${host}`);
          return host;
        }
      }
    } catch {}

    // 方法 2: Expo Go 注入的全局变量
    if (typeof global !== 'undefined') {
      // @ts-ignore — Expo Go 注入的调试宿主地址
      const expoDebuggerHost: string | undefined = global.__expo_debugger_host__;
      if (expoDebuggerHost) {
        const host = expoDebuggerHost.split(':')[0];
        if (host && host !== 'localhost' && host !== '127.0.0.1') {
          console.log(`[API] Host from global: ${host}`);
          return host;
        }
      }
    }

    // 方法 3: 通过 NativeModules.SourceCode 获取 scriptURL
    const { NativeModules } = require('react-native');
    const scriptUrl: string | undefined =
      NativeModules?.SourceCode?.scriptURL ||
      NativeModules?.SourceCode?.getConstants?.()?.scriptURL;
    
    if (scriptUrl) {
      const match = scriptUrl.match(/^https?:\/\/([^:\/]+)/);
      if (match && match[1]) {
        const host = match[1];
        if (host !== 'localhost' && host !== '127.0.0.1') {
          console.log(`[API] Host from scriptURL: ${host}`);
          return host;
        }
      }
    }

    // 方法 4: 真机检测 — 非模拟器且所有方法失败时用硬编码兜底
    const Device = require('expo-device');
    if (Device.isDevice) {
      console.log(`[API] Real device detected, using fallback LAN IP: ${DEV_LAN_IP_FALLBACK}`);
      return DEV_LAN_IP_FALLBACK;
    }
  } catch (e) {
    if (__DEV__) {
      console.log('[API] getDevServerHost fallback:', e);
    }
  }

  return ''; // 返回空 = 使用模拟器默认地址
}

/**
 * 智能解析 API 基础地址
 * 
 * 自动识别运行环境，零配置切换：
 * 
 * | 环境                  | 解析结果                          |
 * |-----------------------|-----------------------------------|
 * | 生产环境（EAS Build） | https://api.superdriver.app       |
 * | 开发 + iOS 模拟器     | http://localhost:3000              |
 * | 开发 + Android 模拟器 | http://10.0.2.2:3000              |
 * | 开发 + 真机（扫码）   | http://192.168.x.x:3000（自动）   |
 */
function resolveBaseUrl(): string {
  // ── 生产环境 → HTTPS ──
  if (!__DEV__) {
    console.log(`[API] Production mode → ${PRODUCTION_API}`);
    return PRODUCTION_API;
  }

  // ── 开发环境 → 自动检测宿主机 IP ──
  const lanHost = getDevServerHost();

  if (lanHost) {
    // 真机调试：DevServer 返回了局域网 IP
    const url = `http://${lanHost}:${DEV_API_PORT}`;
    console.log(`[API] Dev real device → ${url}`);
    return url;
  }

  // 模拟器/Simulator：使用平台默认
  const url = Platform.select({
    android: `http://10.0.2.2:${DEV_API_PORT}`,
    ios: `http://localhost:${DEV_API_PORT}`,
    default: `http://localhost:${DEV_API_PORT}`,
  })!;

  console.log(`[API] Dev simulator → ${url}`);
  return url;
}

export const BASE_URL = resolveBaseUrl();

// 请求超时时间 (毫秒)
const REQUEST_TIMEOUT = 30000;

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: REQUEST_TIMEOUT,
});

// ============================================================================
// [HIGH-002 修复] Session ID 管理 - 使用加密安全随机数
// ============================================================================

let currentSessionId: string | null = null;

/**
 * 获取当前 Session ID（延迟初始化）
 */
async function ensureSessionId(): Promise<string> {
  if (!currentSessionId) {
    currentSessionId = await generateSecureSessionId();
  }
  return currentSessionId;
}

export const setSessionId = (id: string) => { 
  if (id && typeof id === 'string') {
    currentSessionId = id; 
  }
};

export const getSessionId = () => currentSessionId;

// ============================================================================
// 安全拦截器
// ============================================================================

// 安全拦截器：自动添加 JWT Token 和签名
api.interceptors.request.use(async (config) => {
  // 添加 Session ID
  const sessionId = await ensureSessionId();
  config.headers['x-session-id'] = sessionId;

  // 获取请求体
  const body = config.data ? JSON.stringify(config.data) : '';

  // 使用安全 headers（包含签名）
  const secureHeaders = await createSecureHeaders(body);
  Object.assign(config.headers, secureHeaders);

  if (__DEV__) {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params || '');
  }
  return config;
});

// ============================================================================
// [CRITICAL-002 修复] 开发环境自动登录 - 严格限制
// ============================================================================

/**
 * 开发环境自动登录
 * 
 * ⚠️ 安全警告：此函数仅用于开发调试
 * - 仅在 __DEV__ 环境下可用
 * - 使用测试凭据，不得用于生产
 */
const devAutoLogin = async (): Promise<boolean> => {
  // [CRITICAL-002 修复] 严格检查环境
  if (!__DEV__) {
    console.error('[API] SECURITY: devAutoLogin called in production - BLOCKED');
    return false;
  }

  try {
    console.log('[API] Attempting dev auto-login (DEV ONLY)...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // ⚠️ 测试凭据 - 仅用于开发环境
        phone: '13800138000',
        code: '888888'  // 对应 .env 中的 TEST_VERIFICATION_CODE
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[API] Dev auto-login failed:', response.status);
      return false;
    }

    const json = await response.json();
    // API 响应包装在 { success: true, data: { ... } } 结构中
    const { accessToken, refreshToken } = json.data || json;
    
    if (!accessToken || !refreshToken) {
      console.error('[API] Invalid token response');
      return false;
    }
    
    await saveTokens(accessToken, refreshToken);
    console.log('[API] Dev auto-login success');
    return true;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      console.error('[API] Dev auto-login timed out');
    } else {
      console.error('[API] Dev auto-login error:', e);
    }
    return false;
  }
};

// ============================================================================
// 响应拦截器
// ============================================================================

// 响应拦截器：处理限流和错误，自动刷新 token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const { status, data } = error.response;

      // 处理限流错误
      if (status === 429) {
        const resetTime = data.resetTime ? new Date(data.resetTime).toLocaleTimeString() : '稍后';
        console.warn(`[API] Rate limit exceeded. Reset at: ${resetTime}`);
      }

      // 处理认证错误 - 自动刷新 token 并重试
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.warn('[API] Authentication failed. Attempting to refresh token...');

        // 首先尝试刷新 token
        const refreshed = await refreshAccessToken(BASE_URL);

        if (refreshed) {
          console.log('[API] Token refreshed, retrying request...');
          // 获取新 token 并重试
          const newToken = await getAccessToken();
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }

        // [CRITICAL-002 修复] 如果刷新失败，尝试重新登录（仅开发环境）
        if (__DEV__) {
          const loggedIn = await devAutoLogin();
          if (loggedIn) {
            const newToken = await getAccessToken();
            if (newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          }
        }

        console.error('[API] Failed to refresh authentication');
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// API 方法
// ============================================================================

// 辅助函数：解析 API 响应
const unwrapResponse = <T>(response: { success?: boolean; data?: T } | T): T => {
  // API 响应格式: { success: boolean, data: T }
  if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
    return response.data as T;
  }
  return response as T;
};

export const getProfile = async () => {
  const res = await api.get('/profile');
  return unwrapResponse(res.data);
};

export const getAgents = async () => {
  const res = await api.get('/agents');
  return unwrapResponse(res.data);
};

export const getChatList = async () => {
  const res = await api.get('/chat/list');
  return unwrapResponse(res.data) || [];
};

/**
 * 获取 IM 会话列表
 * 返回包含最新消息内容和时间的会话数据
 */
export const getIMSessions = async (limit = 20) => {
  const res = await api.get('/im/sessions', { params: { limit } });
  return unwrapResponse(res.data) || { sessions: [], total: 0, total_unread: 0 };
};

/**
 * 标记所有 IM 消息为已读
 * 清零未读数
 */
export const markIMSessionsAsRead = async () => {
  const res = await api.put('/im/sessions');
  return unwrapResponse(res.data);
};

export const getChatHistory = async (agentId?: string, limit = 20, afterId?: string) => {
  const params: Record<string, string | number> = { limit };
  if (agentId) params.agentId = agentId;
  if (afterId && afterId !== '0') params.afterId = afterId;
  const res = await api.get('/chat/history', { params });
  return unwrapResponse(res.data) || [];
};

export const sendVentingMessage = async (content: string, agentId?: string, routedAgentId?: string) => {
  const payload: Record<string, string> = { content };
  if (agentId) payload.agentId = agentId;
  if (routedAgentId) payload.routedAgentId = routedAgentId;

  const res = await api.post('/chat/vent', payload);
  return unwrapResponse(res.data);
};

export const recordConsent = async () => {
  const res = await api.post('/profile', { action: 'consent' });
  return unwrapResponse(res.data);
};

export const updateProfile = async (data: Record<string, unknown>) => {
  const res = await api.post('/profile', { action: 'update', data });
  return unwrapResponse(res.data);
};

export const getEnterprises = async () => {
  const res = await api.get('/enterprises');
  return unwrapResponse(res.data) || [];
};

export const toggleEnterprise = async (enterpriseId: string) => {
  const res = await api.post('/enterprises', { action: 'toggle', enterpriseId });
  return unwrapResponse(res.data);
};

export default api;
