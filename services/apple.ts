/**
 * Apple Login Service for React Native / Expo
 * 
 * Sign in with Apple 授权登录服务
 * 
 * ⚠️ 重要说明：
 * - Apple 登录仅支持 iOS 平台
 * - 需要安装 expo-apple-authentication
 * - 需要在 app.json 中启用 usesAppleSignIn: true
 * - 需要在 Apple Developer Console 配置 Sign in with Apple 能力
 * 
 * 安装：
 *   npx expo install expo-apple-authentication
 * 
 * 配置 app.json：
 *   {
 *     "expo": {
 *       "ios": {
 *         "usesAppleSignIn": true
 *       },
 *       "plugins": ["expo-apple-authentication"]
 *     }
 *   }
 */

import { Platform, Alert } from 'react-native';
import { BASE_URL } from './api';
import { saveTokens, saveApiSecret } from '../lib/security';

// ============================================================================
// 类型定义
// ============================================================================

export interface AppleLoginResult {
  success: boolean;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  clientSecret?: string;
  isNewUser?: boolean;
  profile?: {
    nickname: string;
    email: string;
    fullName?: {
      givenName: string | null;
      familyName: string | null;
    };
  };
  error?: string;
}

export interface AppleCredential {
  user: string;                 // Apple 用户标识符
  email: string | null;         // 用户邮箱（仅首次授权返回）
  fullName: {
    givenName: string | null;
    familyName: string | null;
  } | null;
  identityToken: string;        // JWT Token（用于后端验证）
  authorizationCode: string;    // 授权码
}

// ============================================================================
// 动态导入 (避免 Android 端报错)
// ============================================================================

let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;

async function loadAppleAuth() {
  if (Platform.OS !== 'ios') {
    return null;
  }
  
  try {
    AppleAuthentication = await import('expo-apple-authentication');
    return AppleAuthentication;
  } catch (error) {
    console.log('[Apple] Failed to load expo-apple-authentication:', error);
    return null;
  }
}

// ============================================================================
// 后端 API
// ============================================================================

const APPLE_LOGIN_API = `${BASE_URL}/api/auth/apple`;

// ============================================================================
// Apple Login Service
// ============================================================================

export class AppleLoginService {

  /**
   * 检查 Apple 登录是否可用
   * 仅 iOS 13+ 支持
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      const auth = await loadAppleAuth();
      if (!auth) return false;
      
      return await auth.isAvailableAsync();
    } catch (error) {
      console.log('[Apple] Availability check failed:', error);
      return false;
    }
  }

  /**
   * Apple 授权登录
   * 
   * @param inviteCode - 可选的邀请码
   * @returns 登录结果
   */
  static async login(inviteCode?: string): Promise<AppleLoginResult> {
    try {
      // 1. 检查平台和可用性
      if (Platform.OS !== 'ios') {
        return {
          success: false,
          error: 'Apple 登录仅支持 iOS 设备'
        };
      }

      const auth = await loadAppleAuth();
      if (!auth) {
        return {
          success: false,
          error: '请安装 expo-apple-authentication'
        };
      }

      const isAvailable = await auth.isAvailableAsync();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Apple 登录不可用，请检查系统版本'
        };
      }

      // 2. 开发环境模拟
      if (__DEV__ && Platform.OS !== 'ios') {
        console.log('[Apple] DEV mode: Using mock flow');
        return await this.mockLogin(inviteCode);
      }

      // 3. 发起 Apple 授权请求
      console.log('[Apple] Starting authentication...');
      
      const credential = await auth.signInAsync({
        requestedScopes: [
          auth.AppleAuthenticationScope.FULL_NAME,
          auth.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('[Apple] Got credential:', {
        user: credential.user?.substring(0, 16) + '...',
        hasEmail: !!credential.email,
        hasFullName: !!credential.fullName,
      });

      // 4. 发送到后端验证并获取 Token
      return await this.exchangeCredentialForToken({
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
        identityToken: credential.identityToken || '',
        authorizationCode: credential.authorizationCode || '',
      }, inviteCode);

    } catch (error: any) {
      console.error('[Apple] Login error:', error);
      
      // 处理用户取消
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return {
          success: false,
          error: '已取消登录'
        };
      }

      return {
        success: false,
        error: error.message || 'Apple 登录失败'
      };
    }
  }

  /**
   * 模拟 Apple 登录（仅用于开发测试）
   */
  private static async mockLogin(inviteCode?: string): Promise<AppleLoginResult> {
    console.log('[Apple] Mock login flow');
    
    // 模拟授权延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟凭证
    const mockCredential: AppleCredential = {
      user: `apple_mock_${Date.now()}`,
      email: 'mock@example.com',
      fullName: {
        givenName: 'Test',
        familyName: 'User',
      },
      identityToken: `mock_identity_token_${Date.now()}`,
      authorizationCode: `mock_auth_code_${Date.now()}`,
    };

    return await this.exchangeCredentialForToken(mockCredential, inviteCode);
  }

  /**
   * 用 Apple 凭证换取应用 Token
   */
  static async exchangeCredentialForToken(
    credential: AppleCredential, 
    inviteCode?: string
  ): Promise<AppleLoginResult> {
    try {
      console.log('[Apple] Exchanging credential for token');

      const response = await fetch(APPLE_LOGIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: credential.user,
          email: credential.email,
          fullName: credential.fullName,
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          inviteCode,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        console.error('[Apple] Token exchange failed:', json);
        return {
          success: false,
          error: json.error || 'Login failed'
        };
      }

      const { data } = json;

      // 保存 Token 到安全存储
      if (data.accessToken && data.refreshToken) {
        await saveTokens(data.accessToken, data.refreshToken);
      }

      // 保存客户端签名密钥
      if (data.clientSecret) {
        await saveApiSecret(data.clientSecret);
      }

      console.log('[Apple] Login successful, isNewUser:', data.isNewUser);

      return {
        success: true,
        userId: data.userId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        clientSecret: data.clientSecret,
        isNewUser: data.isNewUser,
        profile: data.profile,
      };

    } catch (error) {
      console.error('[Apple] Exchange token error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * 获取 Apple 凭证状态
   * 用于检查用户是否已撤销授权
   */
  static async getCredentialState(userId: string): Promise<'authorized' | 'revoked' | 'not_found' | 'error'> {
    if (Platform.OS !== 'ios') {
      return 'error';
    }

    try {
      const auth = await loadAppleAuth();
      if (!auth) return 'error';

      const state = await auth.getCredentialStateAsync(userId);
      
      switch (state) {
        case auth.AppleAuthenticationCredentialState.AUTHORIZED:
          return 'authorized';
        case auth.AppleAuthenticationCredentialState.REVOKED:
          return 'revoked';
        case auth.AppleAuthenticationCredentialState.NOT_FOUND:
          return 'not_found';
        default:
          return 'error';
      }
    } catch (error) {
      console.error('[Apple] Get credential state error:', error);
      return 'error';
    }
  }
}

// 导出便捷函数
export const loginWithApple = AppleLoginService.login.bind(AppleLoginService);
export const isAppleLoginAvailable = AppleLoginService.isAvailable.bind(AppleLoginService);

export default AppleLoginService;
