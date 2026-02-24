/**
 * 工作台头部组件
 * 展开/收缩的数据面板
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusDot } from '../ui/StatusDot';
import { IconButton } from '../ui/IconButton';
import { GRADIENTS, TEXT, SUCCESS, DANGER } from '../../styles/colors';
import { ANIMATION } from '../../config/constants';
import { formatCurrencyInt } from '../../utils/formatters';

const { header } = ANIMATION;

export interface WorkbenchHeaderProps {
    scrollY: Animated.Value;
    onlinePlatforms: number;
    totalPlatforms: number;
    totalRevenue: number;
    totalOrders: number;
    unreadCount: number;
    yesterdayRevenue?: number;
    onPlatformPress?: () => void;
    onNotificationPress?: () => void;
    onPerformancePress?: () => void;
    profile?: { name?: string; nickname?: string };
}

export const WorkbenchHeader: React.FC<WorkbenchHeaderProps> = ({
    scrollY,
    onlinePlatforms,
    totalPlatforms,
    totalRevenue,
    totalOrders,
    unreadCount,
    yesterdayRevenue = 0,
    onPlatformPress,
    onNotificationPress,
    onPerformancePress,
    profile,
}) => {
    const EXPANDED_HEIGHT = header.expandedHeight;
    const COMPACT_HEIGHT = header.compactHeight;
    const SCROLL_RANGE = EXPANDED_HEIGHT - COMPACT_HEIGHT;

    // 动画插值
    const headerHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [EXPANDED_HEIGHT, COMPACT_HEIGHT],
        extrapolate: 'clamp',
    });

    const expandedOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_RANGE * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const compactOpacity = scrollY.interpolate({
        inputRange: [SCROLL_RANGE * 0.4, SCROLL_RANGE],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // 计算同比
    const revenueChange = yesterdayRevenue > 0
        ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(0)
        : null;

    const greeting = `${profile?.nickname || profile?.name || '老铁'}，今日辛苦了`;

    return (
        <Animated.View style={[styles.container, { height: headerHeight }]}>
            <LinearGradient
                colors={GRADIENTS.darkHeader}
                style={styles.gradient}
            >
                {/* 展开状态内容 */}
                <Animated.View style={[styles.expandedContent, { opacity: expandedOpacity }]}>
                    <SafeAreaView edges={['top']} style={styles.expandedInner}>
                        {/* 顶部栏 */}
                        <View style={styles.topBar}>
                            <View style={styles.topBarLeft}>
                                <Text style={styles.greeting}>{greeting}</Text>
                                <TouchableOpacity style={styles.statusBadge} onPress={onPlatformPress}>
                                    <StatusDot status={onlinePlatforms > 0 ? 'online' : 'offline'} size={6} />
                                    <Text style={styles.statusText}>{onlinePlatforms}/{totalPlatforms} 平台</Text>
                                    <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.7)" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.topBarRight}>
                                <IconButton
                                    icon="notifications-outline"
                                    color="#fff"
                                    badge={unreadCount}
                                    onPress={onNotificationPress}
                                />
                            </View>
                        </View>

                        {/* 核心数据 */}
                        <View style={styles.coreStats}>
                            <TouchableOpacity style={styles.mainStat} onPress={onPerformancePress}>
                                <Text style={styles.mainStatLabel}>今日收入</Text>
                                <View style={styles.mainStatRow}>
                                    <Text style={styles.currencySymbol}>¥</Text>
                                    <Text style={styles.mainStatValue}>{totalRevenue.toFixed(2)}</Text>
                                </View>
                                {revenueChange && (
                                    <Text style={[styles.mainStatCompare, Number(revenueChange) >= 0 && styles.compareUp]}>
                                        {Number(revenueChange) >= 0 ? '↑' : '↓'} 较昨日{Math.abs(Number(revenueChange))}%
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </Animated.View>

                {/* 紧凑状态内容 */}
                <Animated.View style={[styles.compactContent, { opacity: compactOpacity }]}>
                    <SafeAreaView edges={['top']} style={styles.compactInner}>
                        <View style={styles.compactBar}>
                            <View style={styles.compactLeft}>
                                <Text style={styles.compactRevenue}>{formatCurrencyInt(totalRevenue)}</Text>
                                <Text style={styles.compactLabel}>今日收入</Text>
                            </View>
                            <View style={styles.compactRight}>
                                <TouchableOpacity style={styles.compactBadge} onPress={onPlatformPress}>
                                    <StatusDot status={onlinePlatforms > 0 ? 'online' : 'offline'} size={6} />
                                    <Text style={styles.compactBadgeText}>{onlinePlatforms}</Text>
                                </TouchableOpacity>
                                <IconButton
                                    icon="notifications-outline"
                                    color="#fff"
                                    size={20}
                                    badge={unreadCount}
                                    onPress={onNotificationPress}
                                />
                            </View>
                        </View>
                    </SafeAreaView>
                </Animated.View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
    },
    expandedContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    expandedInner: {
        flex: 1,
    },
    compactContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    compactInner: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 12,
    },

    // 顶部栏
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 4,
        marginBottom: 8,
    },
    topBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    greeting: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    statusText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    topBarRight: {
        flexDirection: 'row',
        gap: 16,
    },

    // 核心数据
    coreStats: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    mainStat: {
        marginBottom: 0,
    },
    mainStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 0,
    },
    mainStatRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currencySymbol: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginRight: 2,
    },
    mainStatValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -1,
    },
    mainStatCompare: {
        marginTop: 0,
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
    },
    compareUp: {
        color: SUCCESS,
        fontWeight: '600',
    },

    // 融合卡片样式：平台 + 订单 + 详情
    unifiedCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cardSection: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    cardIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardSectionValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    cardSectionLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
    },
    cardDivider: {
        width: 1,
        height: 28,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },

    // 紧凑模式
    compactBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    compactLeft: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    compactRevenue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    compactLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
    },
    compactRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    compactBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    compactBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
});

export default WorkbenchHeader;
