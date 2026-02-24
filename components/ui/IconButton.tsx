/**
 * IconButton 图标按钮组件
 * 支持徽章显示
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';

export interface IconButtonProps {
    icon: string;
    size?: number;
    color?: string;
    badge?: number | string;
    badgeColor?: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    size = 22,
    color = '#fff',
    badge,
    badgeColor,
    onPress,
    style,
}) => {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
            <Ionicons name={icon as any} size={size} color={color} />
            {badge !== undefined && badge !== 0 && (
                <View style={styles.badgeContainer}>
                    <Badge text={badge} color={badgeColor} size="sm" />
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        padding: 4,
    },
    badgeContainer: {
        position: 'absolute',
        top: -2,
        right: -4,
    },
});

export default IconButton;
