/**
 * TodayPerformanceSheet - 重构版
 * 使用拆分后的子组件，从606行减至约180行
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
import { TEXT, BACKGROUND, BORDER, PRIMARY, DANGER } from '../styles/colors';

// 导入子组件
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
    { id: '5', platform: '滴滴出行', platformColor: '#FF6600', time: '08:15', from: '龙阳路', to: '虹桥火车站', amount: 96.5, type: 'completed', duration: '38分钟' },
    { id: '6', platform: '货拉拉', platformColor: '#00B578', time: '07:00', from: '青浦仓库', to: '嘉定配送点', amount: 120.0, type: 'completed', duration: '55分钟' },
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

const PLATFORM_FILTERS = ['全部', '滴滴', '货拉拉', '曹操'];

// ==================== 类型定义 ====================

interface TodayPerformanceSheetProps {
    visible: boolean;
    onClose: () => void;
    totalRevenue: number;
    totalOrders: number;
}

// ==================== 主组件 ====================

export default function TodayPerformanceSheet({
    visible,
    onClose,
    totalRevenue,
    totalOrders,
}: TodayPerformanceSheetProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'orders'>('overview');
    const [activeFilter, setActiveFilter] = useState(0);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* 顶部导航 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="chevron-down" size={28} color={TEXT.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>今日业绩</Text>
                    <TouchableOpacity style={styles.shareBtn}>
                        <Ionicons name="share-outline" size={22} color={PRIMARY} />
                    </TouchableOpacity>
                </View>

                {/* Tab 切换 */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Ionicons name="analytics" size={18} color={activeTab === 'overview' ? PRIMARY : TEXT.secondary} />
                        <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>收入概览</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
                        onPress={() => setActiveTab('orders')}
                    >
                        <Ionicons name="list" size={18} color={activeTab === 'orders' ? PRIMARY : TEXT.secondary} />
                        <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>订单明细</Text>
                        {totalOrders > 0 && (
                            <View style={styles.tabBadge}>
                                <Text style={styles.tabBadgeText}>{totalOrders}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Tab 内容 */}
                {activeTab === 'overview' ? (
                    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                        <RevenueCard totalRevenue={totalRevenue} totalOrders={totalOrders} />
                        <PlatformDistribution platforms={PLATFORM_SUMMARY} />
                        <TimeSlotAnalysis slots={TIME_SLOTS} />
                        <View style={{ height: 40 }} />
                    </ScrollView>
                ) : (
                    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                        {/* 筛选器 */}
                        <View style={styles.filters}>
                            {PLATFORM_FILTERS.map((filter, i) => (
                                <TouchableOpacity
                                    key={filter}
                                    style={[styles.filterChip, activeFilter === i && styles.filterChipActive]}
                                    onPress={() => setActiveFilter(i)}
                                >
                                    <Text style={[styles.filterText, activeFilter === i && styles.filterTextActive]}>
                                        {filter}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {/* 订单列表 */}
                        {MOCK_ORDERS.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: BACKGROUND.card,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: BORDER.light,
    },
    closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '600', color: TEXT.primary },
    shareBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: BACKGROUND.card,
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: BACKGROUND.primary,
        gap: 6,
    },
    tabActive: { backgroundColor: `${PRIMARY}15` },
    tabText: { fontSize: 14, color: TEXT.secondary, fontWeight: '500' },
    tabTextActive: { color: PRIMARY, fontWeight: '600' },
    tabBadge: {
        backgroundColor: DANGER,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    tabBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
    tabContent: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: BACKGROUND.card,
        borderWidth: 1,
        borderColor: BORDER.light,
    },
    filterChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
    filterText: { fontSize: 13, color: TEXT.primary, fontWeight: '500' },
    filterTextActive: { color: '#fff' },
});
