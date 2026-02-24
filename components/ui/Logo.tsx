/**
 * Logo 品牌/头像组件
 * 用于平台 Logo、企业 Logo 等
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export interface LogoProps {
    text: string;
    backgroundColor?: string;
    size?: 'sm' | 'md' | 'lg';
    emoji?: boolean;  // 是否是 emoji 模式
    style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({
    text,
    backgroundColor = '#007AFF',
    size = 'md',
    emoji = false,
    style,
}) => {
    const sizeConfig = {
        sm: { container: 36, fontSize: 16, emojiSize: 18 },
        md: { container: 48, fontSize: 20, emojiSize: 24 },
        lg: { container: 64, fontSize: 28, emojiSize: 32 },
    };

    const s = sizeConfig[size];

    return (
        <View style={[
            styles.container,
            {
                width: s.container,
                height: s.container,
                borderRadius: s.container * 0.2,
                backgroundColor: emoji ? `${backgroundColor}30` : backgroundColor,
            },
            style,
        ]}>
            <Text style={[
                styles.text,
                { fontSize: emoji ? s.emojiSize : s.fontSize },
            ]}>
                {emoji ? text : text.charAt(0)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '700',
        color: '#fff',
    },
});

export default Logo;
