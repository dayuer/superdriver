/**
 * 时段收入分析组件
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TEXT, BACKGROUND, PRIMARY } from '../../styles/colors';

export interface TimeSlot {
    time: string;
    range: string;
    amount: number;
    orders: number;
    highlight?: boolean;
}

export interface TimeSlotAnalysisProps {
    slots: TimeSlot[];
}

export const TimeSlotAnalysis: React.FC<TimeSlotAnalysisProps> = ({ slots }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>时段收入分析</Text>
            <View style={styles.slots}>
                {slots.map((slot) => (
                    <View key={slot.time} style={[styles.slot, slot.highlight && styles.slotHighlight]}>
                        <Text style={[styles.slotLabel, slot.highlight && styles.labelHighlight]}>
                            {slot.time}
                        </Text>
                        <Text style={styles.slotRange}>{slot.range}</Text>
                        <Text style={[styles.slotAmount, slot.highlight && styles.amountHighlight]}>
                            ¥{slot.amount.toFixed(0)}
                        </Text>
                        <Text style={styles.slotOrders}>{slot.orders}单</Text>
                    </View>
                ))}
            </View>
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
    slots: {
        flexDirection: 'row',
        gap: 6,
    },
    slot: {
        flex: 1,
        backgroundColor: BACKGROUND.primary,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
    },
    slotHighlight: {
        backgroundColor: `${PRIMARY}12`,
        borderWidth: 1,
        borderColor: `${PRIMARY}25`,
    },
    slotLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: TEXT.primary,
    },
    labelHighlight: {
        color: PRIMARY,
    },
    slotRange: {
        fontSize: 9,
        color: TEXT.tertiary,
        marginTop: 1,
        marginBottom: 6,
    },
    slotAmount: {
        fontSize: 13,
        fontWeight: '700',
        color: TEXT.primary,
    },
    amountHighlight: {
        color: PRIMARY,
    },
    slotOrders: {
        fontSize: 9,
        color: TEXT.tertiary,
        marginTop: 2,
    },
});

export default TimeSlotAnalysis;
