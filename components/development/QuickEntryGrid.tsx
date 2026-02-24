/**
 * 快捷入口网格组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QUICK_ENTRIES, QuickEntry } from '../../config/constants';
import { TEXT, DANGER } from '../../styles/colors';

export interface QuickEntryGridProps {
    entries?: QuickEntry[];
    onPress?: (id: string) => void;
}

export const QuickEntryGrid: React.FC<QuickEntryGridProps> = ({
    entries = QUICK_ENTRIES,
    onPress,
}) => {
    return (
        <View style={styles.container}>
            {entries.map((entry) => (
                <TouchableOpacity
                    key={entry.id}
                    style={styles.item}
                    onPress={() => onPress?.(entry.id)}
                >
                    <View style={[styles.iconWrapper, { backgroundColor: `${entry.color}15` }]}>
                        <Ionicons name={entry.icon as any} size={24} color={entry.color} />
                        {entry.badge && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{entry.badge}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.label}>{entry.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        paddingVertical: 16,
    },
    item: {
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: DANGER,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#fff',
    },
    label: {
        marginTop: 8,
        fontSize: 12,
        color: TEXT.inverse,
        fontWeight: '500',
    },
});

export default QuickEntryGrid;
