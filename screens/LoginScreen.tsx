/**
 * LoginScreen - 第三方授权登录页面
 * 
 * 支持的登录方式：
 * - 微信 (WeChat) - 突出显示
 * - 支付宝、淘宝、QQ、微博、Apple - 折叠显示
 * 
 * 排除：手机号、邮箱登录
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WeChatLoginService } from '../services/wechat';
import { AppleLoginService } from '../services/apple';

// 启用 Android LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 第三方登录平台配置
interface LoginProvider {
  id: string;
  name: string;
  loginText: string;
  icon: string;
  color: string;
  bgColor: string;
}

// 微信 - 突出显示的主要登录方式
const PRIMARY_PROVIDER: LoginProvider = {
  id: 'wechat',
  name: '微信',
  loginText: '微信登录',
  icon: 'chatbubble-ellipses',
  color: '#FFFFFF',
  bgColor: '#07C160',
};

// 其他登录方式 - 默认折叠
const OTHER_PROVIDERS: LoginProvider[] = [
  {
    id: 'alipay',
    name: '支付宝',
    loginText: '支付宝登录',
    icon: 'wallet',
    color: '#FFFFFF',
    bgColor: '#1677FF',
  },
  {
    id: 'taobao',
    name: '淘宝',
    loginText: '淘宝登录',
    icon: 'bag-handle',
    color: '#FFFFFF',
    bgColor: '#FF6A00',
  },
  {
    id: 'qq',
    name: 'QQ',
    loginText: 'QQ登录',
    icon: 'chatbubbles',
    color: '#FFFFFF',
    bgColor: '#12B7F5',
  },
  {
    id: 'weibo',
    name: '微博',
    loginText: '微博登录',
    icon: 'eye',
    color: '#FFFFFF',
    bgColor: '#E6162D',
  },
  {
    id: 'apple',
    name: 'Apple',
    loginText: 'Apple登录',
    icon: 'logo-apple',
    color: '#FFFFFF',
    bgColor: '#000000',
  },
];

export interface LoginScreenProps {
  onLoginSuccess?: (provider: string, userData: any) => void;
  onSkip?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onSkip,
}) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [showOtherProviders, setShowOtherProviders] = useState(false);

  const handleProviderLogin = async (provider: LoginProvider) => {
    setLoadingProvider(provider.id);
    
    try {
      console.log(`[Login] Initiating ${provider.name} login...`);
      
      if (provider.id === 'wechat') {
        // 微信登录
        const result = await WeChatLoginService.login();
        
        if (result.success) {
          console.log('[Login] WeChat login successful');
          onLoginSuccess?.(provider.id, {
            userId: result.userId,
            isNewUser: result.isNewUser,
            profile: result.profile,
          });
        } else {
          Alert.alert('登录失败', result.error || '请稍后重试');
        }
      } else if (provider.id === 'apple') {
        // Apple 登录
        if (Platform.OS !== 'ios') {
          Alert.alert('提示', 'Apple 登录仅支持 iOS 设备');
          return;
        }
        
        const isAvailable = await AppleLoginService.isAvailable();
        if (!isAvailable) {
          Alert.alert('提示', 'Apple 登录不可用，请检查系统版本');
          return;
        }
        
        const result = await AppleLoginService.login();
        
        if (result.success) {
          console.log('[Login] Apple login successful');
          onLoginSuccess?.(provider.id, {
            userId: result.userId,
            isNewUser: result.isNewUser,
            profile: result.profile,
          });
        } else {
          // 用户取消不显示错误
          if (result.error !== '已取消登录') {
            Alert.alert('登录失败', result.error || '请稍后重试');
          }
        }
      } else {
        // 其他登录方式 - 暂未实现
        await new Promise(resolve => setTimeout(resolve, 1000));
        Alert.alert(
          '登录提示',
          `${provider.name}登录功能即将上线，敬请期待！`,
          [{ text: '我知道了', style: 'default' }]
        );
      }
      
    } catch (error) {
      console.error(`[Login] ${provider.name} login failed:`, error);
      Alert.alert('登录失败', '请检查网络连接后重试');
    } finally {
      setLoadingProvider(null);
    }
  };

  const toggleOtherProviders = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowOtherProviders(!showOtherProviders);
  };

  const handleAgreementPress = (type: 'user' | 'privacy') => {
    Alert.alert(
      type === 'user' ? '用户协议' : '隐私政策',
      '协议内容页面开发中...',
      [{ text: '确定' }]
    );
  };

  // 渲染主要登录按钮（微信）- 突出样式
  const renderPrimaryButton = () => {
    const isLoading = loadingProvider === PRIMARY_PROVIDER.id;
    
    return (
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => handleProviderLogin(PRIMARY_PROVIDER)}
        disabled={loadingProvider !== null}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#07C160', '#06AD56']}
          style={styles.primaryButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>微信登录</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // 渲染其他登录方式的行
  const renderProviderRow = (provider: LoginProvider) => {
    const isLoading = loadingProvider === provider.id;
    
    return (
      <TouchableOpacity
        key={provider.id}
        style={styles.providerRow}
        onPress={() => handleProviderLogin(provider)}
        disabled={loadingProvider !== null}
        activeOpacity={0.7}
      >
        <View style={[styles.providerIcon, { backgroundColor: provider.bgColor }]}>
          <Ionicons name={provider.icon as any} size={18} color={provider.color} />
        </View>
        <Text style={styles.providerText}>{provider.loginText}</Text>
        <View style={styles.providerRight}>
          {isLoading ? (
            <ActivityIndicator color="#C7C7CC" size="small" />
          ) : (
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F7" />
      
      <SafeAreaView style={styles.safeArea}>
        {/* 跳过按钮 */}
        {onSkip && (
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>跳过</Text>
          </TouchableOpacity>
        )}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo 区域 */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.logoContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.appName}>超级司机</Text>
            <Text style={styles.subtitle}>你只管握好方向盘，剩下的世界交给我</Text>
          </View>
          
          {/* 主要登录按钮 - 微信 */}
          <View style={styles.primarySection}>
            {renderPrimaryButton()}
          </View>
          
          {/* 分割线 & 其他登录方式 */}
          <View style={styles.otherSection}>
            {/* 展开/收起按钮 */}
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={toggleOtherProviders}
              activeOpacity={0.7}
            >
              <View style={styles.expandLine} />
              <View style={styles.expandContent}>
                <Text style={styles.expandText}>
                  {showOtherProviders ? '收起其他登录方式' : '其他登录方式'}
                </Text>
                <Ionicons 
                  name={showOtherProviders ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color="#8E8E93" 
                />
              </View>
              <View style={styles.expandLine} />
            </TouchableOpacity>
            
            {/* 其他登录方式列表 - 折叠区域 */}
            {showOtherProviders && (
              <View style={styles.providersList}>
                {OTHER_PROVIDERS.map(renderProviderRow)}
              </View>
            )}
          </View>
          
          {/* 协议说明 */}
          <View style={styles.agreementContainer}>
            <Text style={styles.agreementText}>
              登录即表示同意
              <Text 
                style={styles.agreementLink}
                onPress={() => handleAgreementPress('user')}
              >
                《用户协议》
              </Text>
              与
              <Text 
                style={styles.agreementLink}
                onPress={() => handleAgreementPress('privacy')}
              >
                《隐私政策》
              </Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  safeArea: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 8 : 16,
    right: 16,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 56,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  primarySection: {
    marginBottom: 32,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#07C160',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  otherSection: {
    marginBottom: 24,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  expandLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  expandContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  expandText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  providersList: {
    gap: 10,
    marginTop: 8,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  providerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
    marginLeft: 12,
  },
  providerRight: {
    width: 24,
    alignItems: 'center',
  },
  agreementContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  agreementText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  agreementLink: {
    color: '#007AFF',
  },
});

export default LoginScreen;
