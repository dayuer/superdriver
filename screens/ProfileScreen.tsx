/**
 * ProfileScreenNew - 重构版个人中心
 * 使用拆分后的子组件，大幅减少代码量
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProfile } from '../types';
import { getDriverProfile, DriverProfile } from '../services/recruitment-api';
import { fetchWithCache, CACHE_CONFIG } from '../services/cache';
import MyOrdersScreen from './MyOrdersScreen';

// 导入子组件
import {
    ProfileHeaderCard,
    StatsCard,
    ServiceGrid,
    DriverCard,
    MenuList,
    type StatItem,
    type ServiceItem,
    type MenuItem,
} from '../components/profile';
import { BACKGROUND, TEXT, GRADIENTS } from '../styles/colors';

// ==================== 配置常量 ====================

const GRID_SERVICES: ServiceItem[] = [
    { id: 'orders', icon: 'receipt-outline', label: '我的订单', color: '#FF6B35', badge: 0 },
    { id: 'wallet', icon: 'wallet-outline', label: '钱包', color: '#34C759', badge: 0 },
    { id: 'help', icon: 'chatbubble-ellipses-outline', label: '客服', color: '#5856D6', badge: 1 },
    { id: 'settings', icon: 'settings-outline', label: '设置', color: '#8E8E93', badge: 0 },
];

const MENU_ITEMS: MenuItem[] = [
    { id: 'profile', icon: 'person-outline', label: '个人资料' },
    { id: 'vehicle', icon: 'car-outline', label: '我的车辆' },
    { id: 'feedback', icon: 'megaphone-outline', label: '意见反馈' },
    { id: 'about', icon: 'information-circle-outline', label: '关于', value: 'v2.1.0' },
];

// ==================== 类型定义 ====================

interface ProfileScreenProps {
    profile?: UserProfile;
    onRefresh?: () => void;
}

type SubPage = 'orders' | 'wallet' | 'settings' | null;

// ==================== 主组件 ====================

export default function ProfileScreenNew({ profile, onRefresh }: ProfileScreenProps) {
    const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState<SubPage>(null);
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadDriverProfile();
    }, []);

    const loadDriverProfile = async () => {
        try {
            setLoading(true);
            const driver = await fetchWithCache<DriverProfile | null>(
                'driver_profile',
                () => getDriverProfile(),
                { ttl: CACHE_CONFIG.DEFAULT_TTL },
            );
            setDriverProfile(driver);
        } catch (error) {
            console.log('No driver profile found');
        } finally {
            setLoading(false);
        }
    };

    // ==================== 派生数据 ====================

    const stats: StatItem[] = [
        { label: '订单', value: driverProfile?.completedOrders || 0 },
        { label: '评分', value: driverProfile?.rating?.toFixed(1) || '5.0' },
        { label: '累计收入', value: `¥${driverProfile ? '12,580' : '0'}` },
    ];

    // ==================== 事件处理 ====================

    const handleServicePress = (id: string) => {
        if (id === 'orders') setCurrentPage('orders');
        if (id === 'wallet') setCurrentPage('wallet');
        if (id === 'settings') setCurrentPage('settings');
    };

    const handleMenuPress = (id: string) => {
        console.log('Menu pressed:', id);
        // TODO: 导航到对应页面
    };

    // ==================== 子页面渲染 ====================

    if (currentPage === 'orders') {
        return <MyOrdersScreen onBack={() => setCurrentPage(null)} />;
    }

    // ==================== 头部渐变效果 ====================

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // ==================== 渲染 ====================

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* 固定头部背景 */}
            <Animated.View style={[styles.fixedHeader, { opacity: headerOpacity }]}>
                <LinearGradient colors={GRADIENTS.darkHeader} style={styles.fixedHeaderBg}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.fixedHeaderContent}>
                            <Animated.Text style={styles.fixedHeaderTitle}>我的</Animated.Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </Animated.View>

            <Animated.ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* 头部用户卡片 */}
                <ProfileHeaderCard
                    profile={profile}
                    onPress={() => console.log('Edit profile')}
                    onSettingsPress={() => setCurrentPage('settings')}
                />

                {/* 内容区域 */}
                <View style={styles.contentContainer}>
                    {/* 数据统计 */}
                    <StatsCard stats={stats} />

                    {/* 服务网格 */}
                    <ServiceGrid items={GRID_SERVICES} onPress={handleServicePress} />

                    {/* 司机卡片 */}
                    <DriverCard
                        driver={driverProfile}
                        onPress={() => console.log('View driver profile')}
                        onBindPress={() => console.log('Become driver')}
                    />

                    {/* 菜单列表 */}
                    <MenuList items={MENU_ITEMS} onPress={handleMenuPress} />

                    {/* 底部安全区 */}
                    <View style={{ height: 100 }} />
                </View>
            </Animated.ScrollView>
        </View>
    );
}

// ==================== 样式 ====================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND.primary,
    },
    scrollView: {
        flex: 1,
    },
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    fixedHeaderBg: {
        paddingBottom: 12,
    },
    fixedHeaderContent: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fixedHeaderTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
    contentContainer: {
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: BACKGROUND.primary,
        paddingTop: 8,
    },
});
