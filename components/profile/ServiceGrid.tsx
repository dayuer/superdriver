/**
 * 服务网格组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../ui/Badge';
import { TEXT, BACKGROUND, BORDER } from '../../styles/colors';

export interface ServiceItem {
    id: string;
    icon: string;
    label: string;
    color: string;
    badge?: number;
}

export interface ServiceGridProps {
    items: ServiceItem[];
    onPress?: (id: string) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
    items,
    onPress,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.item}
                        onPress={() => onPress?.(item.id)}
                    >
                        <View style={[styles.iconWrapper, { backgroundColor: `${item.color}15` }]}>
                            <Ionicons name={item.icon as any} size={24} color={item.color} />
                            {item.badge != null && item.badge > 0 && (
                                <View style={styles.badgeWrapper}>
                                    <Badge text={item.badge} size="sm" />
                                </View>
                            )}
                        </View>
                        <Text style={styles.label}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND.card,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    item: {
        width: '25%',
        alignItems: 'center',
        paddingVertical: 8,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badgeWrapper: {
        position: 'absolute',
        top: -4,
        right: -4,
    },
    label: {
        fontSize: 12,
        color: TEXT.primary,
        marginTop: 8,
    },
});

export default ServiceGrid;
