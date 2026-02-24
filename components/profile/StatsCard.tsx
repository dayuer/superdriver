/**
 * 数据统计卡片组件
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TEXT, BACKGROUND, BORDER, SUCCESS, WARNING } from '../../styles/colors';

export interface StatItem {
    label: string;
    value: string | number;
    suffix?: string;
    color?: string;
}

export interface StatsCardProps {
    stats: StatItem[];
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
    return (
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <View key={index} style={styles.item}>
                    <View style={styles.valueRow}>
                        <Text style={[styles.value, stat.color && { color: stat.color }]}>
                            {stat.value}
                        </Text>
                        {stat.suffix && <Text style={styles.suffix}>{stat.suffix}</Text>}
                    </View>
                    <Text style={styles.label}>{stat.label}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: BACKGROUND.card,
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 16,
        paddingVertical: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: BORDER.light,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
        color: TEXT.primary,
    },
    suffix: {
        fontSize: 12,
        color: TEXT.secondary,
        marginLeft: 2,
    },
    label: {
        fontSize: 12,
        color: TEXT.secondary,
        marginTop: 4,
    },
});

// 移除最后一个元素的右边框
StatsCard.displayName = 'StatsCard';

export default StatsCard;
