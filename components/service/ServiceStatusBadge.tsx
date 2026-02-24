/**
 * ServiceStatusBadge — 服务事件状态徽标
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    // 通用
    active:     { label: '进行中', color: '#007AFF', bg: '#007AFF15' },
    closed:     { label: '已结案', color: '#8E8E93', bg: '#8E8E9315' },

    // 法律
    consulting:          { label: '咨询中', color: '#5856D6', bg: '#5856D615' },
    evidence_collecting: { label: '取证中', color: '#FF9500', bg: '#FF950015' },
    negotiating:         { label: '协商中', color: '#AF52DE', bg: '#AF52DE15' },
    filing:              { label: '立案中', color: '#FF3B30', bg: '#FF3B3015' },
    litigation:          { label: '诉讼中', color: '#FF2D55', bg: '#FF2D5515' },

    // 保险
    reported:  { label: '已报案', color: '#007AFF', bg: '#007AFF15' },
    assessing: { label: '定损中', color: '#FF9500', bg: '#FF950015' },
    approved:  { label: '已批复', color: '#34C759', bg: '#34C75915' },
    paid:      { label: '已赔付', color: '#30D158', bg: '#30D15815' },
    denied:    { label: '已拒赔', color: '#FF3B30', bg: '#FF3B3015' },
    appealing: { label: '申诉中', color: '#FF6B35', bg: '#FF6B3515' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
    urgent: { label: '紧急', color: '#FF3B30' },
    high:   { label: '重要', color: '#FF9500' },
    normal: { label: '普通', color: '#8E8E93' },
    low:    { label: '低',   color: '#C7C7CC' },
};

interface Props {
    status: string;
    priority?: string;
    size?: 'sm' | 'md';
}

export const ServiceStatusBadge: React.FC<Props> = ({ status, priority, size = 'md' }) => {
    const statusCfg = STATUS_CONFIG[status] ?? { label: status, color: '#8E8E93', bg: '#8E8E9315' };
    const priorityCfg = priority ? PRIORITY_CONFIG[priority] : null;
    const isSmall = size === 'sm';

    return (
        <View style={styles.row}>
            {priorityCfg && priorityCfg.label !== '普通' && (
                <View style={[styles.badge, { backgroundColor: priorityCfg.color + '15' }, isSmall && styles.badgeSm]}>
                    <View style={[styles.dot, { backgroundColor: priorityCfg.color }]} />
                    <Text style={[styles.badgeText, { color: priorityCfg.color }, isSmall && styles.textSm]}>
                        {priorityCfg.label}
                    </Text>
                </View>
            )}
            <View style={[styles.badge, { backgroundColor: statusCfg.bg }, isSmall && styles.badgeSm]}>
                <Text style={[styles.badgeText, { color: statusCfg.color }, isSmall && styles.textSm]}>
                    {statusCfg.label}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 6 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 4,
    },
    badgeSm: { paddingHorizontal: 6, paddingVertical: 2 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    textSm: { fontSize: 10 },
});

export default ServiceStatusBadge;
