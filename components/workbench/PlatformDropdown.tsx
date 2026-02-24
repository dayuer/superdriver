/**
 * 平台管理下拉面板组件
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Animated,
    Dimensions,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlatformBinding } from '../../config/mock-data';
import { PlatformCard } from './PlatformCard';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS, WARNING } from '../../styles/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PlatformDropdownProps {
    visible: boolean;
    platforms: PlatformBinding[];
    onClose: () => void;
    onToggleStatus: (id: string) => void;
    onToggleAll: (toOnline: boolean) => void;
    onBind: (id: string) => void;
    onUnbind: (id: string) => void;
}

export const PlatformDropdown: React.FC<PlatformDropdownProps> = ({
    visible,
    platforms,
    onClose,
    onToggleStatus,
    onToggleAll,
    onBind,
    onUnbind,
}) => {
    const [showAllPlatforms, setShowAllPlatforms] = useState(false);

    const boundPlatforms = platforms.filter(p => p.isBound);
    const unboundPlatforms = platforms.filter(p => !p.isBound);
    const displayPlatforms = showAllPlatforms ? platforms : boundPlatforms;

    const allOnline = boundPlatforms.every(p => p.status === 'online');
    const allOffline = boundPlatforms.every(p => p.status === 'offline');

    // 统计数据
    const onlineCount = boundPlatforms.filter(p => p.status === 'online').length;
    const totalRevenue = boundPlatforms.reduce((acc, p) => acc + p.todayRevenue, 0);
    const totalOrders = boundPlatforms.reduce((acc, p) => acc + p.todayOrders, 0);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {/* 头部 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="chevron-down" size={28} color={TEXT.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>平台管理</Text>
                    <View style={{ width: 40 }} />
                </View>

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

                {/* 平台列表 */}
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
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
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>可绑定平台</Text>
                                <TouchableOpacity onPress={() => setShowAllPlatforms(!showAllPlatforms)}>
                                    <Text style={styles.toggleShowText}>{showAllPlatforms ? '收起' : '展开'}</Text>
                                </TouchableOpacity>
                            </View>
                            {showAllPlatforms && unboundPlatforms.map(platform => (
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
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: BACKGROUND.card,
        borderBottomWidth: 1,
        borderBottomColor: BORDER.light,
    },
    closeBtn: {
        width: 40,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: TEXT.primary,
    },
    summary: {
        flexDirection: 'row',
        backgroundColor: BACKGROUND.card,
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: '700',
        color: TEXT.primary,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: TEXT.secondary,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: BORDER.light,
        marginVertical: 4,
    },
    quickActions: {
        flexDirection: 'row',
        backgroundColor: BACKGROUND.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    quickActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: `${SUCCESS}15`,
    },
    quickActionOffline: {
        backgroundColor: `${WARNING}15`,
    },
    quickActionActive: {
        backgroundColor: SUCCESS,
    },
    quickActionActiveOffline: {
        backgroundColor: WARNING,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: SUCCESS,
    },
    quickActionTextOffline: {
        color: WARNING,
    },
    quickActionTextActive: {
        color: '#fff',
    },
    list: {
        flex: 1,
    },
    section: {
        backgroundColor: BACKGROUND.card,
        marginTop: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: TEXT.secondary,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    toggleShowText: {
        fontSize: 13,
        color: PRIMARY,
    },
});

export default PlatformDropdown;
