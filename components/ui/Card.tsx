/**
 * Card 基础卡片组件
 */
import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BACKGROUND, BORDER } from '../../styles/colors';
import { RADIUS, SPACING } from '../../styles/base';

export interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'elevated' | 'flat' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'elevated',
    padding = 'md',
}) => {
    const paddingValue = {
        none: 0,
        sm: SPACING.sm,
        md: SPACING.lg,
        lg: SPACING.xl,
    }[padding];

    return (
        <View style={[
            styles.base,
            variant === 'elevated' && styles.elevated,
            variant === 'outlined' && styles.outlined,
            { padding: paddingValue },
            style,
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        backgroundColor: BACKGROUND.card,
        borderRadius: RADIUS.lg,
    },
    elevated: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
        },
        android: {
            elevation: 2,
        },
    }) as ViewStyle,
    outlined: {
        borderWidth: 1,
        borderColor: BORDER.light,
    },
});

export default Card;
