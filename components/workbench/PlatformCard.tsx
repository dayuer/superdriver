/**
 * 平台卡片组件
 * 用于平台管理下拉面板中的单个平台项
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlatformBinding } from '../../config/mock-data';
import { StatusDot } from '../ui/StatusDot';
import { getStatusText } from '../../utils/status-helpers';
import { TEXT, BORDER, PRIMARY, SUCCESS, BACKGROUND } from '../../styles/colors';
import { formatCurrencyInt } from '../../utils/formatters';

export interface PlatformCardProps {
    platform: PlatformBinding;
    onToggleStatus?: (id: string) => void;
    onBind?: (id: string) => void;
    onUnbind?: (id: string) => void;
    compact?: boolean;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
    platform,
    onToggleStatus,
    onBind,
    onUnbind,
    compact = false,
}) => {
    const { id, name, logo, color, isBound, status, todayRevenue, todayOrders, unreadNotifications } = platform;

    if (!isBound) {
        // 未绑定状态 - 显示绑定按钮
        return (
            <TouchableOpacity
                style={[styles.container, styles.unboundContainer]}
                onPress={() => onBind?.(id)}
            >
                <View style={[styles.logo, { backgroundColor: `${color}20` }]}>
                    <Text style={styles.logoText}>{logo}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.unboundHint}>点击绑定</Text>
                </View>
                <View style={styles.bindBtn}>
                    <Ionicons name="add-circle" size={24} color={PRIMARY} />
                </View>
            </TouchableOpacity>
        );
    }

    // 已绑定状态 - 显示完整信息
    return (
        <View style={styles.container}>
            <View style={[styles.logo, { backgroundColor: `${color}20` }]}>
                <Text style={styles.logoText}>{logo}</Text>
            </View>

            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{name}</Text>
                    <View style={styles.statusTag}>
                        <StatusDot status={status} size={6} />
                        <Text style={styles.statusText}>{getStatusText(status)}</Text>
                    </View>
                </View>
                {!compact && (
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>今日收入 <Text style={styles.statValue}>{formatCurrencyInt(todayRevenue)}</Text></Text>
                        <Text style={styles.statDivider}>|</Text>
                        <Text style={styles.stat}>订单 <Text style={styles.statValue}>{todayOrders}</Text></Text>
                    </View>
                )}
            </View>

            {/* 状态切换开关 */}
            <TouchableOpacity
                style={[styles.toggleBtn, status === 'online' ? styles.toggleOnline : styles.toggleOffline]}
                onPress={() => onToggleStatus?.(id)}
            >
                <Text style={[styles.toggleText, status === 'online' ? styles.toggleTextOnline : styles.toggleTextOffline]}>
                    {status === 'online' ? '收工' : '接单'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BACKGROUND.card,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: BORDER.light,
    },
    unboundContainer: {
        opacity: 0.7,
    },
    logo: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    logoText: {
        fontSize: 22,
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: TEXT.primary,
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F0F0F5',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        color: TEXT.secondary,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    stat: {
        fontSize: 12,
        color: TEXT.secondary,
    },
    statValue: {
        fontWeight: '600',
        color: TEXT.primary,
    },
    statDivider: {
        fontSize: 12,
        color: TEXT.tertiary,
    },
    unboundHint: {
        fontSize: 12,
        color: TEXT.tertiary,
        marginTop: 2,
    },
    bindBtn: {
        padding: 4,
    },
    toggleBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
    },
    toggleOnline: {
        backgroundColor: `${SUCCESS}15`,
    },
    toggleOffline: {
        backgroundColor: `${PRIMARY}15`,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '600',
    },
    toggleTextOnline: {
        color: SUCCESS,
    },
    toggleTextOffline: {
        color: PRIMARY,
    },
});

export default PlatformCard;
