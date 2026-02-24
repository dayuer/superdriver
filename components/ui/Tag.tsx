/**
 * Tag 标签组件
 * 用于显示分类标签、特性标签等
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { TEXT, PRIMARY, SUCCESS, DANGER } from '../../styles/colors';

export type TagVariant = 'default' | 'primary' | 'success' | 'danger' | 'new' | 'hot';

export interface TagProps {
    text: string;
    variant?: TagVariant;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const variantStyles: Record<TagVariant, { bg: string; color: string }> = {
    default: { bg: '#F0F0F5', color: TEXT.secondary },
    primary: { bg: `${PRIMARY}15`, color: PRIMARY },
    success: { bg: `${SUCCESS}15`, color: SUCCESS },
    danger: { bg: `${DANGER}15`, color: DANGER },
    new: { bg: SUCCESS, color: '#fff' },
    hot: { bg: DANGER, color: '#fff' },
};

export const Tag: React.FC<TagProps> = ({
    text,
    variant = 'default',
    icon,
    style,
    textStyle,
}) => {
    const v = variantStyles[variant];

    return (
        <View style={[styles.tag, { backgroundColor: v.bg }, style]}>
            {icon}
            <Text style={[styles.text, { color: v.color }, textStyle]}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
    },
    text: {
        fontSize: 11,
        fontWeight: '500',
    },
});

export default Tag;
