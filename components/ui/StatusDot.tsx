/**
 * StatusDot 状态指示点
 * 用于显示在线/离线/忙碌等状态
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { getStatusColor, PlatformStatus } from '../../utils/status-helpers';

export interface StatusDotProps {
    status: PlatformStatus;
    size?: number;
    style?: ViewStyle;
}

export const StatusDot: React.FC<StatusDotProps> = ({
    status,
    size = 6,
    style,
}) => {
    const color = getStatusColor(status);

    return (
        <View
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                },
                style,
            ]}
        />
    );
};

export default StatusDot;
