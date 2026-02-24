/**
 * 工作台屏幕 (重构版)
 * 组装子组件，保持精简
 */
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, RefreshControl } from 'react-native';
import { UserProfile } from '../types';
import { usePlatforms, useNotifications } from '../hooks';
import { ANIMATION } from '../config/constants';
import {
    WorkbenchHeader,
    NotificationFeed,
    VoiceAssistantFAB,
} from './workbench';
import DashboardSheet from './DashboardSheet';
import { BACKGROUND } from '../styles/colors';

const { header } = ANIMATION;

export interface WorkbenchScreenProps {
    profile?: UserProfile;
    onVoicePress?: () => void;
}

export default function WorkbenchScreen({ profile, onVoicePress }: WorkbenchScreenProps) {
    // 使用自定义 Hooks 管理状态
    const {
        platforms,
        boundPlatforms,
        onlinePlatforms,
        totalRevenue,
        totalOrders,
        toggleStatus,
        toggleAll,
        bindPlatform,
        unbindPlatform,
    } = usePlatforms();

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    // 本地 UI 状态
    const [showDashboard, setShowDashboard] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // 滚动动画
    const scrollY = useRef(new Animated.Value(0)).current;

    // 下拉刷新
    const handleRefresh = async () => {
        setRefreshing(true);
        // 模拟刷新延迟
        setTimeout(() => setRefreshing(false), 1000);
    };

    // 处理通知点击
    const handleNotificationPress = (item: any) => {
        markAsRead(item.id);
    };

    // 处理通知操作
    const handleNotificationAction = (payload: string) => {
        console.log('[Workbench] Action:', payload);
        // TODO: 实现具体操作逻辑
    };

    return (
        <View style={styles.container}>
            {/* 动画头部 */}
            <WorkbenchHeader
                scrollY={scrollY}
                onlinePlatforms={onlinePlatforms}
                totalPlatforms={boundPlatforms.length}
                totalRevenue={totalRevenue}
                totalOrders={totalOrders}
                unreadCount={unreadCount}
                yesterdayRevenue={totalRevenue * 0.9} // 模拟昨日数据
                onPlatformPress={() => setShowDashboard(true)}
                onNotificationPress={() => {/* TODO: 通知中心 */ }}
                onPerformancePress={() => setShowDashboard(true)}
                profile={profile}
            />

            {/* 滚动内容 */}
            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingTop: header.expandedHeight }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        progressViewOffset={header.expandedHeight}
                        tintColor="#007AFF"
                    />
                }
            >
                {/* 工作流通知 */}
                <NotificationFeed
                    items={notifications}
                    onItemPress={handleNotificationPress}
                    onAction={handleNotificationAction}
                    onMarkAllRead={markAllAsRead}
                />

                {/* 底部安全间距 */}
                <View style={{ height: 120 }} />
            </Animated.ScrollView>

            {/* 统一工作台面板 */}
            <DashboardSheet
                visible={showDashboard}
                onClose={() => setShowDashboard(false)}
                totalRevenue={totalRevenue}
                totalOrders={totalOrders}
                platforms={platforms}
                onToggleStatus={toggleStatus}
                onToggleAll={toggleAll}
                onBind={bindPlatform}
                onUnbind={unbindPlatform}
            />

            {/* 语音按钮：按下就开始录音 */}
            <VoiceAssistantFAB
                onPress={onVoicePress ?? (() => console.log('[Workbench] Voice pressed'))}
                onLongPress={onVoicePress ?? (() => console.log('[Workbench] Voice pressed'))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND.primary,
    },
    scrollView: {
        flex: 1,
    },
});
