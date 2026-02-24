/**
 * EmptyState 空状态组件
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT } from '../../styles/colors';

export interface EmptyStateProps {
    icon?: string;
    iconColor?: string;
    title?: string;
    description?: string;
    style?: ViewStyle;
    children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'cube-outline',
    iconColor = '#C7C7CC',
    title = '暂无数据',
    description,
    style,
    children,
}) => {
    return (
        <View style={[styles.container, style]}>
            <Ionicons name={icon as any} size={48} color={iconColor} />
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: TEXT.secondary,
        marginTop: 12,
    },
    description: {
        fontSize: 14,
        color: TEXT.tertiary,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default EmptyState;
