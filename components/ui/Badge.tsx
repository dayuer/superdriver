/**
 * Badge 徽章组件
 * 用于显示数量、状态标签等
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { DANGER } from '../../styles/colors';

export interface BadgeProps {
    text: string | number;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
    text,
    color = DANGER,
    size = 'md',
    style,
    textStyle,
}) => {
    const sizeStyles = {
        sm: { minWidth: 14, height: 14, paddingHorizontal: 3, fontSize: 9 },
        md: { minWidth: 18, height: 18, paddingHorizontal: 5, fontSize: 10 },
        lg: { minWidth: 22, height: 22, paddingHorizontal: 6, fontSize: 12 },
    };

    const s = sizeStyles[size];

    return (
        <View style={[
            styles.badge,
            { backgroundColor: color, minWidth: s.minWidth, height: s.height, paddingHorizontal: s.paddingHorizontal },
            style
        ]}>
            <Text style={[styles.text, { fontSize: s.fontSize }, textStyle]}>
                {typeof text === 'number' && text > 99 ? '99+' : text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
});

export default Badge;
