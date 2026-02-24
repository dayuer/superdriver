/**
 * 收入概览卡片组件
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TEXT, GRADIENTS } from '../../styles/colors';

export interface RevenueCardProps {
    totalRevenue: number;
    totalOrders: number;
    avgPerOrder?: number;
    onlineHours?: string;
}

export const RevenueCard: React.FC<RevenueCardProps> = ({
    totalRevenue,
    totalOrders,
    avgPerOrder,
    onlineHours = '5.2',
}) => {
    const perOrder = avgPerOrder ?? (totalRevenue / Math.max(totalOrders, 1));

    return (
        <LinearGradient colors={GRADIENTS.darkHeader} style={styles.container}>
            <Text style={styles.label}>今日总收入</Text>
            <View style={styles.row}>
                <Text style={styles.currency}>¥</Text>
                <Text style={styles.amount}>{totalRevenue.toFixed(2)}</Text>
            </View>
            <View style={styles.stats}>
                <View style={styles.stat}>
                    <Ionicons name="document-text" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.statValue}>{totalOrders}单</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                    <Ionicons name="cash-outline" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.statValue}>¥{perOrder.toFixed(0)}/单</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                    <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.statValue}>{onlineHours}小时</Text>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    currency: {
        fontSize: 20,
        fontWeight: '300',
        color: '#fff',
        marginTop: 6,
        marginRight: 2,
    },
    amount: {
        fontSize: 40,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -1,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statValue: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
});

export default RevenueCard;
