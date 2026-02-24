/**
 * WeChat Login Service for React Native / Expo
 * 
 * 微信授权登录服务
 * 
 * ⚠️ 重要提示：
 * 在生产环境使用前，需要完成以下配置：
 * 
 * 1. 微信开放平台注册应用
 *    - 移动应用需要在 open.weixin.qq.com 注册
 *    - 获取 AppID 和 AppSecret
 *    - 配置 Bundle ID (iOS) 和包名 (Android)
 * 
 * 2. 安装微信 SDK
 *    - iOS: 需要自定义 Development Build
 *    - Android: 需要自定义 Development Build
 *    - Expo Go 不支持微信 SDK，必须使用 EAS Build
 * 
 * 3. 可选方案（服务器端 OAuth）：
 *    如果无法集成原生 SDK，可以使用 Web OAuth 流程：
 *    - 打开微信授权页面 (WebView)
 *    - 用户授权后重定向回 App
 *    - App 捕获 code 并发送到后端
 */

import { Platform, Linking, Alert } from 'react-native';
import { BASE_URL } from './api';
import { saveTokens, saveApiSecret } from '../lib/security';

// ============================================================================
// 类型定义
// ============================================================================

export interface WeChatLoginResult {
  success: boolean;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  clientSecret?: string;
  isNewUser?: boolean;
  profile?: {
    nickname: string;
    avatar: string;
    gender: string;
    city: string;
  };
  error?: string;
}

export interface WeChatAuthConfig {
  appId: string;
  universalLink?: string;  // iOS Universal Link
}

// ============================================================================
// 配置
// ============================================================================

// 微信开放平台 AppID
// ⚠️ 替换为您的真实 AppID
const WX_APP_ID = 'wx_your_app_id';

/** 检查 AppID 是否已配置（非占位符） */
const isAppIdConfigured = (): boolean => {
  if (WX_APP_ID.startsWith('wx_your_') || WX_APP_ID.length < 10) {
    if (__DEV__) {
      console.warn(
        '⚠️ [WeChat] WX_APP_ID 未配置！\n' +
        '请在 services/wechat.ts 中替换为真实的微信开放平台 AppID\n' +
        '获取方式: https://open.weixin.qq.com/'
      );
    }
    return false;
  }
  return true;
};

// 后端 OAuth API 地址
const WX_LOGIN_API = `${BASE_URL}/api/auth/wechat`;

// ============================================================================
// WeChat Login Service
// ============================================================================

export class WeChatLoginService {
  private static isSDKInstalled = false;

  /**
   * 检查微信是否已安装
   */
  static async isWeChatInstalled(): Promise<boolean> {
    try {
      // 尝试使用微信 URL Scheme 检查
      const canOpen = await Linking.canOpenURL('weixin://');
      return canOpen;
    } catch (error) {
      console.log('[WeChat] Check installed error:', error);
      return false;
    }
  }

  /**
   * 微信授权登录
   * 
   * @param inviteCode - 可选的邀请码
   * @returns 登录结果
   */
  static async login(inviteCode?: string): Promise<WeChatLoginResult> {
    try {
      // 0. [M-003] 检查 AppID 是否已配置
      if (!isAppIdConfigured()) {
        return {
          success: false,
          error: '微信登录未配置，请联系开发者',
        };
      }

      // 1. 检查微信是否安装
      const installed = await this.isWeChatInstalled();
      
      if (!installed) {
        return {
          success: false,
          error: '请先安装微信'
        };
      }

      // 2. 发起微信授权
      // 在实际集成中，这里会调用微信 SDK
      // 由于 Expo Go 限制，我们使用模拟授权流程演示
      
      if (__DEV__) {
        console.log('[WeChat] DEV mode: Using mock OAuth flow');
        return await this.mockLogin(inviteCode);
      }

      // 生产环境：调用微信 SDK
      // 需要安装 react-native-wechat-lib 或类似库
      return await this.nativeLogin(inviteCode);
      
    } catch (error) {
      console.error('[WeChat] Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WeChat login failed'
      };
    }
  }

  /**
   * 原生微信 SDK 登录
   * 
   * ⚠️ 需要安装 react-native-wechat-lib 并配置原生模块
   */
  private static async nativeLogin(inviteCode?: string): Promise<WeChatLoginResult> {
    // TODO: 集成微信原生 SDK
    // 需要完成以下步骤：
    // 
    // 1. 安装 react-native-wechat-lib:
    //    npm install react-native-wechat-lib
    // 
    // 2. 配置 iOS:
    //    - Info.plist 添加 URL Schemes
    //    - AppDelegate 处理回调
    // 
    // 3. 配置 Android:
    //    - AndroidManifest.xml 添加权限和 Activity
    //    - 创建 WXEntryActivity
    // 
    // 4. 调用示例:
    //    import * as WeChat from 'react-native-wechat-lib';
    //    await WeChat.registerApp(WX_APP_ID, universalLink);
    //    const response = await WeChat.sendAuthRequest('snsapi_userinfo', 'app');
    //    const code = response.code;

    // 当前返回未实现提示
    Alert.alert(
      '功能开发中',
      '微信登录需要使用自定义构建 (EAS Build)，Expo Go 暂不支持。\n\n开发模式可使用模拟登录测试。',
      [{ text: '确定' }]
    );

    return {
      success: false,
      error: 'Native WeChat SDK not integrated'
    };
  }

  /**
   * 模拟微信登录（仅用于开发测试）
   */
  private static async mockLogin(inviteCode?: string): Promise<WeChatLoginResult> {
    console.log('[WeChat] Mock login flow');
    
    // 模拟授权延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟获取授权码
    const mockCode = `mock_code_${Date.now()}`;
    
    // 调用后端 API
    return await this.exchangeCodeForToken(mockCode, inviteCode);
  }

  /**
   * 用授权码换取 Token
   * 
   * @param code - 微信授权返回的 code
   * @param inviteCode - 可选的邀请码
   */
  static async exchangeCodeForToken(code: string, inviteCode?: string): Promise<WeChatLoginResult> {
    try {
      console.log('[WeChat] Exchanging code for token');
      
      const response = await fetch(WX_LOGIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          inviteCode,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        console.error('[WeChat] Token exchange failed:', json);
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

      console.log('[WeChat] Login successful, isNewUser:', data.isNewUser);

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
      console.error('[WeChat] Exchange token error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * 获取微信授权 URL（用于 WebView 方案）
   */
  static async getAuthUrl(state: string = 'app'): Promise<string | null> {
    try {
      const response = await fetch(`${WX_LOGIN_API}?state=${state}`);
      const json = await response.json();
      
      if (json.success && json.data?.authUrl) {
        return json.data.authUrl;
      }
      return null;
    } catch (error) {
      console.error('[WeChat] Get auth URL error:', error);
      return null;
    }
  }
}

// 导出便捷函数
export const loginWithWeChat = WeChatLoginService.login.bind(WeChatLoginService);
export const isWeChatInstalled = WeChatLoginService.isWeChatInstalled.bind(WeChatLoginService);

export default WeChatLoginService;
