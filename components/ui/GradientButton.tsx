/**
 * GradientButton 渐变按钮组件
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface GradientButtonProps {
    title: string;
    colors?: readonly [string, string, ...string[]];
    onPress?: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
    title,
    colors = ['#007AFF', '#0055D4'],
    onPress,
    style,
    textStyle,
    disabled = false,
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled}
            style={[styles.container, style]}
        >
            <LinearGradient
                colors={disabled ? ['#C7C7CC', '#A0A0A0'] : colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <Text style={[styles.text, textStyle]}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default GradientButton;
