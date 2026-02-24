/**
 * 平台收入分布组件
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TEXT, BACKGROUND, BORDER } from '../../styles/colors';

export interface PlatformData {
    name: string;
    logo: string;
    color: string;
    orders: number;
    amount: number;
    percentage: number;
}

export interface PlatformDistributionProps {
    platforms: PlatformData[];
}

export const PlatformDistribution: React.FC<PlatformDistributionProps> = ({ platforms }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>平台收入分布</Text>
            {platforms.map((platform) => (
                <View key={platform.name} style={styles.row}>
                    <View style={[styles.logo, { backgroundColor: platform.color + '20' }]}>
                        <Text style={styles.logoText}>{platform.logo}</Text>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name}>{platform.name}</Text>
                            <Text style={styles.orderCount}>{platform.orders}单</Text>
                        </View>
                        <View style={styles.progressBg}>
                            <View style={[
                                styles.progress,
                                { width: `${platform.percentage}%`, backgroundColor: platform.color }
                            ]} />
                        </View>
                    </View>
                    <Text style={styles.amount}>¥{platform.amount.toFixed(0)}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND.card,
        borderRadius: 14,
        padding: 14,
        marginHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT.primary,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        fontSize: 16,
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: 13,
        fontWeight: '500',
        color: TEXT.primary,
    },
    orderCount: {
        fontSize: 11,
        color: TEXT.tertiary,
    },
    progressBg: {
        height: 4,
        backgroundColor: BORDER.light,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        borderRadius: 2,
    },
    amount: {
        fontSize: 15,
        fontWeight: '700',
        color: TEXT.primary,
        marginLeft: 10,
        minWidth: 50,
        textAlign: 'right',
    },
});

export default PlatformDistribution;
