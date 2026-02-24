/**
 * 订单卡片组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT, BACKGROUND, BORDER, SUCCESS, DANGER } from '../../styles/colors';

export interface OrderData {
    id: string;
    platform: string;
    platformColor: string;
    time: string;
    from: string;
    to: string;
    amount: number;
    type: 'completed' | 'cancelled' | 'pending';
    duration: string;
}

export interface OrderCardProps {
    order: OrderData;
    showTimeline?: boolean;
    onPress?: (order: OrderData) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
    order,
    showTimeline = true,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.7}
            onPress={() => onPress?.(order)}
        >
            <View style={styles.left}>
                <View style={[styles.platformTag, { backgroundColor: order.platformColor }]}>
                    <Text style={styles.platformText}>{order.platform.slice(0, 2)}</Text>
                </View>
                {showTimeline && (
                    <View style={styles.timeline}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineLine} />
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.time}>{order.time}</Text>
                    <Text style={styles.duration}>{order.duration}</Text>
                </View>
                <View style={styles.route}>
                    <View style={styles.location}>
                        <Ionicons name="ellipse" size={8} color={SUCCESS} />
                        <Text style={styles.locationText} numberOfLines={1}>{order.from}</Text>
                    </View>
                    <Ionicons name="arrow-down" size={12} color={TEXT.tertiary} style={{ marginVertical: 2 }} />
                    <View style={styles.location}>
                        <Ionicons name="location" size={10} color={DANGER} />
                        <Text style={styles.locationText} numberOfLines={1}>{order.to}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.right}>
                <Text style={styles.amount}>¥{order.amount.toFixed(0)}</Text>
                <View style={styles.status}>
                    <Ionicons
                        name={order.type === 'completed' ? 'checkmark-circle' : 'close-circle'}
                        size={14}
                        color={order.type === 'completed' ? SUCCESS : DANGER}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: BACKGROUND.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    left: {
        alignItems: 'center',
        marginRight: 12,
    },
    platformTag: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    platformText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    timeline: {
        flex: 1,
        alignItems: 'center',
    },
    timelineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: TEXT.tertiary,
    },
    timelineLine: {
        width: 1,
        flex: 1,
        backgroundColor: BORDER.light,
        marginTop: 4,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    time: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT.primary,
    },
    duration: {
        fontSize: 12,
        color: TEXT.secondary,
    },
    route: {},
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontSize: 13,
        color: TEXT.primary,
        flex: 1,
    },
    right: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginLeft: 12,
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
        color: TEXT.primary,
    },
    status: {},
});

export default OrderCard;
