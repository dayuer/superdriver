/**
 * 加盟卡片组件 (58同城风格)
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FranchiseItem } from '../../services/development';
import { Logo } from '../ui/Logo';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS, WARNING } from '../../styles/colors';

export interface FranchiseCardProps {
    item: FranchiseItem;
    onPress?: (item: FranchiseItem) => void;
    onConsult?: (item: FranchiseItem) => void;
}

export const FranchiseCard: React.FC<FranchiseCardProps> = ({
    item,
    onPress,
    onConsult,
}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.9}
            onPress={() => onPress?.(item)}
        >
            <Logo
                text={item.logoText}
                backgroundColor={item.logoColor}
                size="lg"
            />

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>

                <View style={styles.stats}>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>投资额</Text>
                        <Text style={styles.statValue}>{item.investment}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>预期收益</Text>
                        <Text style={[styles.statValue, { color: WARNING }]}>{item.profit}</Text>
                    </View>
                </View>

                <View style={styles.advantage}>
                    <Ionicons name="checkmark-circle" size={14} color={SUCCESS} />
                    <Text style={styles.advantageText} numberOfLines={1}>{item.advantage}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.consultBtn}
                onPress={(e) => {
                    e.stopPropagation?.();
                    onConsult?.(item);
                }}
            >
                <Text style={styles.consultText}>咨询</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BACKGROUND.card,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
    },
    info: {
        flex: 1,
        marginLeft: 14,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: TEXT.primary,
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        color: TEXT.secondary,
        marginBottom: 10,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stat: {
        flex: 1,
    },
    statLabel: {
        fontSize: 11,
        color: TEXT.tertiary,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT.primary,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: BORDER.light,
        marginHorizontal: 12,
    },
    advantage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    advantageText: {
        fontSize: 12,
        color: SUCCESS,
        flex: 1,
    },
    consultBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: `${PRIMARY}15`,
        borderRadius: 16,
    },
    consultText: {
        fontSize: 13,
        fontWeight: '600',
        color: PRIMARY,
    },
});

export default FranchiseCard;
