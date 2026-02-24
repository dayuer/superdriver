/**
 * 企业卡片组件 - 用于 CommandDeck 轮播
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EnterpriseMetric } from '../../types';
import { getStatusColor, getStatusBg, getStatusText } from '../../utils/status-helpers';

export interface EnterpriseCardProps {
    enterprise: EnterpriseMetric;
    onToggleStatus?: (id: string) => void;
}

export const EnterpriseCard: React.FC<EnterpriseCardProps> = ({
    enterprise,
    onToggleStatus,
}) => {
    const { id, name, color, metrics, latestIntel } = enterprise;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.brandRow}>
                    <View style={[styles.logoDot, { backgroundColor: color }]}>
                        <Text style={styles.logoText}>{name.substring(0, 2)}</Text>
                    </View>
                    <Text style={styles.brandName} numberOfLines={1}>{name}</Text>
                </View>
                <View style={styles.actions}>
                    <View style={[styles.statusPill, { backgroundColor: getStatusBg(metrics.status) }]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(metrics.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(metrics.status) }]}>
                            {getStatusText(metrics.status)}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => onToggleStatus?.(id)} style={styles.powerButton}>
                        <Ionicons
                            name="power"
                            size={18}
                            color={metrics.status === 'online' ? '#FF453A' : 'rgba(255,255,255,0.3)'}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.stats}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>营收</Text>
                    <Text style={styles.statValue}>¥{metrics.revenue}</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>完单</Text>
                    <Text style={styles.statValue}>{metrics.orders}</Text>
                </View>
                {latestIntel && (
                    <View style={styles.intelBadge}>
                        <Ionicons name="flash" size={10} color="#fff" />
                        <Text style={styles.intelText} numberOfLines={1}>
                            {latestIntel.split('：')[0]}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        marginRight: 8,
    },
    logoDot: {
        width: 28,
        height: 28,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    brandName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
    },
    statusDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    powerButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    stat: {
        marginRight: 20,
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 2,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    verticalDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginRight: 20,
    },
    intelBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF453A',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 4,
    },
    intelText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        flex: 1,
    },
});

export default EnterpriseCard;
