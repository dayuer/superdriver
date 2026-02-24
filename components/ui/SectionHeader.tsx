/**
 * SectionHeader 区块标题组件
 * 用于内容区块的统一标题样式
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT, PRIMARY } from '../../styles/colors';

export interface SectionHeaderProps {
    icon?: string;
    iconColor?: string;
    title: string;
    actionText?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    icon,
    iconColor = PRIMARY,
    title,
    actionText,
    onAction,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.titleRow}>
                {icon && (
                    <Ionicons name={icon as any} size={20} color={iconColor} />
                )}
                <Text style={styles.title}>{title}</Text>
            </View>
            {actionText && (
                <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
                    <Text style={styles.actionText}>{actionText}</Text>
                    <Ionicons name="chevron-forward" size={16} color={TEXT.secondary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: TEXT.primary,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    actionText: {
        fontSize: 13,
        color: TEXT.secondary,
    },
});

export default SectionHeader;
