/**
 * useAuth - 认证状态管理 Hook
 * 
 * 职责：
 * - Token 校验（validateToken）
 * - 开发环境自动登录（devAutoLogin）
 * - 第三方登录回调
 * - 游客模式 / 登出
 * 
 * [HIGH-001 重构] App.tsx 精简
 * [HIGH-002 修复] 消除 token 验证重复（3次→1次）
 */
import { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../services/api';
import {
  saveTokens,
  getAccessToken,
  clearTokens,
  saveApiSecret,
} from '../lib/security';

// ============================================================================
// 接口定义
// ============================================================================

interface UseAuthReturn {
  isLoggedIn: boolean;
  isCheckingAuth: boolean;
  handleLoginSuccess: (provider: string, userData: any) => Promise<void>;
  handleSkipLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  /** 调用方注册登录成功后的数据加载回调 */
  onAuthReady: (loader: () => Promise<void>) => void;
}

// ============================================================================
// 工具函数
// ============================================================================

/** 请求超时时间 (毫秒) */
const AUTH_TIMEOUT = 10000;

/**
 * 验证 Token 是否仍然有效
 * 
 * 单一来源：所有 token 校验都走这一个函数
 */
async function validateToken(token: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT);

    const res = await fetch(`${BASE_URL}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 开发环境自动登录 — 获取 Guest Token
 * 
 * ⚠️ 安全警告 [CRITICAL-002]:
 * - 此函数仅在 __DEV__ 环境下执行（调用方已保证）
 * - 不再内部校验 token（职责分离：校验由 checkAuthAndInit 统一处理）
 * 
 * [HIGH-002 修复] 移除了内部的 token 校验逻辑，
 * 之前 ensureDevToken 和 checkAuthAndInit 各做一次校验，
 * 导致启动时最多 3 次 /api/profile 请求。
 * 现在只在 checkAuthAndInit 中做一次，此函数只负责"登录 + 保存 token"。
 */
async function devAutoLogin(): Promise<boolean> {
  try {
    console.log('[Auth] Dev auto-login (DEV ONLY)...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT);

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // ⚠️ 测试凭据 - 仅用于开发环境
        phone: '13800138000',
        code: '888888',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[Auth] Dev auto-login failed:', response.status);
      return false;
    }

    const json = await response.json();
    const { accessToken, refreshToken, userId, clientSecret } = json.data || json;

    if (!accessToken || !refreshToken) {
      if (__DEV__) {
        console.error('[Auth] Invalid token response:', JSON.stringify(json));
      }
      return false;
    }

    await saveTokens(accessToken, refreshToken);

    if (clientSecret) {
      await saveApiSecret(clientSecret);
      console.log('[Auth] Client secret saved');
    }

    console.log('[Auth] Dev auto-login success, userId:', userId);
    return true;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      console.error('[Auth] Dev auto-login timed out');
    } else {
      console.error('[Auth] Dev auto-login error:', e);
    }
    return false;
  }
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth(): UseAuthReturn {
  const [isLoggedIn, setIsLoggedIn] = useState(__DEV__ ? true : false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(__DEV__ ? false : true);
  const [dataLoader, setDataLoader] = useState<(() => Promise<void>) | null>(null);

  const loadData = useCallback(async () => {
    if (dataLoader) await dataLoader();
  }, [dataLoader]);

  /**
   * 启动时认证检查（单一入口）
   * 
   * [HIGH-002 修复] 调用链：
   *   1. getAccessToken() → 有 token?
   *   2. validateToken()  → 有效? → 直接进入         ← 只验证 1 次
   *   3. __DEV__?         → devAutoLogin() → 登录     ← 不再内部重复验证
   *   4. 否则             → 显示登录页
   */
  const checkAuthAndInit = useCallback(async () => {
    setIsCheckingAuth(true);

    try {
      // ── Step 1: 检查现有 Token ──
      const existingToken = await getAccessToken();

      if (existingToken) {
        // ── Step 2: 验证有效性（唯一的一次验证） ──
        const isValid = await validateToken(existingToken);
        if (isValid) {
          console.log('[Auth] Token valid');
          setIsLoggedIn(true);
          await loadData();
          return;
        }
        // Token 无效，清除
        console.log('[Auth] Token invalid, clearing');
        await clearTokens();
      }

      // ── Step 3: 开发环境自动登录 ──
      if (__DEV__) {
        const success = await devAutoLogin();
        if (success) {
          await loadData();
        } else {
          console.log('[Auth] Dev auto-login failed, keeping dev login state');
        }
        // 开发环境始终保持登录态
        setIsLoggedIn(true);
        return;
      }

      // ── Step 4: 生产环境未登录 ──
      setIsLoggedIn(false);
    } catch (e) {
      console.error('[Auth] checkAuthAndInit error:', e);
      if (!__DEV__) setIsLoggedIn(false);
    } finally {
      setIsCheckingAuth(false);
    }
  }, [loadData]);

  useEffect(() => {
    checkAuthAndInit();
  }, [checkAuthAndInit]);

  /**
   * 第三方登录成功回调
   * 
   * [M-002 修复] 实现真实的 token 保存逻辑
   * 社交登录服务（wechat.ts/apple.ts）可能已内部调用 saveTokens，
   * 此处做兜底处理：如果 userData 中包含 token，确保保存
   */
  const handleLoginSuccess = useCallback(async (provider: string, userData: any) => {
    console.log(`[Auth] ${provider} login success`);

    try {
      // 从 userData 中提取 token（可能已由社交登录服务保存）
      const accessToken = userData?.accessToken || userData?.data?.accessToken;
      const refreshToken = userData?.refreshToken || userData?.data?.refreshToken;
      const clientSecret = userData?.clientSecret || userData?.data?.clientSecret;

      if (accessToken && refreshToken) {
        await saveTokens(accessToken, refreshToken);
        console.log('[Auth] Tokens saved from login callback');
      }

      if (clientSecret) {
        await saveApiSecret(clientSecret);
        console.log('[Auth] Client secret saved from login callback');
      }
    } catch (e) {
      console.error('[Auth] Failed to save login credentials:', e);
    }

    setIsLoggedIn(true);
    await loadData();
  }, [loadData]);

  /**
   * 跳过登录（游客模式）
   */
  const handleSkipLogin = useCallback(async () => {
    if (__DEV__) {
      const success = await devAutoLogin();
      if (success) {
        setIsLoggedIn(true);
        await loadData();
        return;
      }
    }
    console.log('[Auth] Guest mode not available in production');
  }, [loadData]);

  /**
   * 登出
   */
  const handleLogout = useCallback(async () => {
    await clearTokens();
    setIsLoggedIn(false);
  }, []);

  /**
   * 注册数据加载回调
   */
  const onAuthReady = useCallback((loader: () => Promise<void>) => {
    setDataLoader(() => loader);
  }, []);

  return {
    isLoggedIn,
    isCheckingAuth,
    handleLoginSuccess,
    handleSkipLogin,
    handleLogout,
    onAuthReady,
  };
}
