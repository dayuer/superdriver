/**
 * DashboardSheet - 统一的工作台面板
 * 融合平台管理和今日业绩
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS, WARNING, DANGER } from '../styles/colors';
import { PlatformBinding } from '../config/mock-data';
import { PlatformCard } from './workbench/PlatformCard';
import {
    RevenueCard,
    PlatformDistribution,
    TimeSlotAnalysis,
    OrderCard,
    type PlatformData,
    type TimeSlot,
    type OrderData,
} from './performance';

// ==================== 配置数据 ====================

const MOCK_ORDERS: OrderData[] = [
    { id: '1', platform: '滴滴出行', platformColor: '#FF6600', time: '14:32', from: '虹桥机场T2', to: '人民广场', amount: 128.5, type: 'completed', duration: '42分钟' },
    { id: '2', platform: '货拉拉', platformColor: '#00B578', time: '12:15', from: '浦东仓库', to: '闵行工业区', amount: 85.0, type: 'completed', duration: '35分钟' },
    { id: '3', platform: '滴滴出行', platformColor: '#FF6600', time: '10:48', from: '陆家嘴', to: '静安寺', amount: 42.0, type: 'completed', duration: '28分钟' },
    { id: '4', platform: '曹操出行', platformColor: '#1A1A2E', time: '09:30', from: '上海站', to: '徐家汇', amount: 58.0, type: 'completed', duration: '25分钟' },
];

const PLATFORM_SUMMARY: PlatformData[] = [
    { name: '滴滴出行', logo: '🚕', color: '#FF6600', orders: 5, amount: 420.5, percentage: 65 },
    { name: '货拉拉', logo: '🚛', color: '#00B578', orders: 3, amount: 180.0, percentage: 28 },
    { name: '曹操出行', logo: '🚗', color: '#1A1A2E', orders: 0, amount: 0, percentage: 0 },
];

const TIME_SLOTS: TimeSlot[] = [
    { time: '早高峰', range: '7-9点', amount: 216.5, orders: 3, highlight: true },
    { time: '上午', range: '9-12点', amount: 100.0, orders: 2, highlight: false },
    { time: '午高峰', range: '12-14点', amount: 85.0, orders: 1, highlight: false },
    { time: '下午', range: '14-17点', amount: 128.5, orders: 1, highlight: true },
];

// ==================== 类型定义 ====================

type TabType = 'platform' | 'revenue' | 'orders';

interface DashboardSheetProps {
    visible: boolean;
    onClose: () => void;
    totalRevenue: number;
    totalOrders: number;
    platforms: PlatformBinding[];
    onToggleStatus: (id: string) => void;
    onToggleAll: (toOnline: boolean) => void;
    onBind: (id: string) => void;
    onUnbind: (id: string) => void;
}

// ==================== 主组件 ====================

export default function DashboardSheet({
    visible,
    onClose,
    totalRevenue,
    totalOrders,
    platforms,
    onToggleStatus,
    onToggleAll,
    onBind,
    onUnbind,
}: DashboardSheetProps) {
    const [activeTab, setActiveTab] = useState<TabType>('platform');
    const [showUnbound, setShowUnbound] = useState(false);

    const boundPlatforms = platforms.filter(p => p.isBound);
    const unboundPlatforms = platforms.filter(p => !p.isBound);
    const onlineCount = boundPlatforms.filter(p => p.status === 'online').length;
    const allOnline = boundPlatforms.every(p => p.status === 'online');
    const allOffline = boundPlatforms.every(p => p.status === 'offline');

    const tabs: { id: TabType; label: string; icon: string; badge?: number }[] = [
        { id: 'platform', label: '平台', icon: 'grid-outline' },
        { id: 'revenue', label: '收入', icon: 'trending-up-outline' },
        { id: 'orders', label: '订单', icon: 'receipt-outline', badge: totalOrders },
    ];

    const renderPlatformTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* 概览统计 */}
            <View style={styles.summary}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{onlineCount}/{boundPlatforms.length}</Text>
                    <Text style={styles.summaryLabel}>在线平台</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: SUCCESS }]}>¥{totalRevenue.toFixed(0)}</Text>
                    <Text style={styles.summaryLabel}>今日收入</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{totalOrders}</Text>
                    <Text style={styles.summaryLabel}>今日订单</Text>
                </View>
            </View>

            {/* 一键操作 */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={[styles.quickActionBtn, allOnline && styles.quickActionActive]}
                    onPress={() => onToggleAll(true)}
                    disabled={allOnline}
                >
                    <Ionicons name="flash" size={18} color={allOnline ? '#fff' : SUCCESS} />
                    <Text style={[styles.quickActionText, allOnline && styles.quickActionTextActive]}>全部上线</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.quickActionBtn, styles.quickActionOffline, allOffline && styles.quickActionActiveOffline]}
                    onPress={() => onToggleAll(false)}
                    disabled={allOffline}
                >
                    <Ionicons name="power" size={18} color={allOffline ? '#fff' : WARNING} />
                    <Text style={[styles.quickActionText, styles.quickActionTextOffline, allOffline && styles.quickActionTextActive]}>全部下线</Text>
                </TouchableOpacity>
            </View>

            {/* 已绑定平台 */}
            {boundPlatforms.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>已绑定平台</Text>
                    {boundPlatforms.map(platform => (
                        <PlatformCard
                            key={platform.id}
                            platform={platform}
                            onToggleStatus={onToggleStatus}
                            onUnbind={onUnbind}
                        />
                    ))}
                </View>
            )}

            {/* 未绑定平台 */}
            {unboundPlatforms.length > 0 && (
                <View style={styles.section}>
                    <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowUnbound(!showUnbound)}>
                        <Text style={styles.sectionTitle}>可绑定平台</Text>
                        <Ionicons name={showUnbound ? 'chevron-up' : 'chevron-down'} size={18} color={TEXT.secondary} />
                    </TouchableOpacity>
                    {showUnbound && unboundPlatforms.map(platform => (
                        <PlatformCard
                            key={platform.id}
                            platform={platform}
                            onBind={onBind}
                        />
                    ))}
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );

    const renderRevenueTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <RevenueCard totalRevenue={totalRevenue} totalOrders={totalOrders} />
            <PlatformDistribution platforms={PLATFORM_SUMMARY} />
            <TimeSlotAnalysis slots={TIME_SLOTS} />
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    const renderOrdersTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {MOCK_ORDERS.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* 顶部导航 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="chevron-down" size={28} color={TEXT.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>工作台</Text>
                    <TouchableOpacity style={styles.shareBtn}>
                        <Ionicons name="ellipsis-horizontal" size={22} color={TEXT.secondary} />
                    </TouchableOpacity>
                </View>

                {/* Tab 切换 */}
                <View style={styles.tabBar}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Ionicons 
                                name={tab.icon as any} 
                                size={18} 
                                color={activeTab === tab.id ? PRIMARY : TEXT.secondary} 
                            />
                            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                                {tab.label}
                            </Text>
                            {tab.badge && tab.badge > 0 && (
                                <View style={styles.tabBadge}>
                                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab 内容 */}
                {activeTab === 'platform' && renderPlatformTab()}
                {activeTab === 'revenue' && renderRevenueTab()}
                {activeTab === 'orders' && renderOrdersTab()}
            </SafeAreaView>
        </Modal>
    );
}

// ==================== 样式 ====================

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND.primary },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: BACKGROUND.card,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: BORDER.light,
    },
    closeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT.primary },
    shareBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: BACKGROUND.card,
        paddingHorizontal: 12,
        paddingBottom: 10,
        gap: 6,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: BACKGROUND.primary,
        gap: 5,
    },
    tabActive: { backgroundColor: `${PRIMARY}12` },
    tabText: { fontSize: 13, color: TEXT.secondary, fontWeight: '500' },
    tabTextActive: { color: PRIMARY, fontWeight: '600' },
    tabBadge: {
        backgroundColor: DANGER,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    tabBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
    tabContent: { flex: 1, paddingTop: 10 },

    // 概览统计
    summary: {
        flexDirection: 'row',
        backgroundColor: BACKGROUND.card,
        paddingVertical: 16,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        borderRadius: 10,
        marginBottom: 10,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryValue: { fontSize: 20, fontWeight: '700', color: TEXT.primary, marginBottom: 2 },
    summaryLabel: { fontSize: 11, color: TEXT.tertiary },
    summaryDivider: { width: 1, backgroundColor: BORDER.light, marginVertical: 4 },

    // 快捷操作
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 10,
    },
    quickActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: `${SUCCESS}12`,
    },
    quickActionOffline: { backgroundColor: `${WARNING}12` },
    quickActionActive: { backgroundColor: SUCCESS },
    quickActionActiveOffline: { backgroundColor: WARNING },
    quickActionText: { fontSize: 13, fontWeight: '600', color: SUCCESS },
    quickActionTextOffline: { color: WARNING },
    quickActionTextActive: { color: '#fff' },

    // 区块
    section: {
        backgroundColor: BACKGROUND.card,
        marginTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: TEXT.tertiary,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
});
