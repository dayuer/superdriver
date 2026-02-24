/**
 * 语音助手悬浮按钮组件
 * 可拖拽、边缘吸附、按下持续波纹动效
 */
import React, { useRef, useCallback } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDraggableFAB } from '../../hooks/useDraggableFAB';
import { GRADIENTS } from '../../styles/colors';

export interface VoiceAssistantFABProps {
    onPress?: () => void;
    onLongPress?: () => void;
}

export const VoiceAssistantFAB: React.FC<VoiceAssistantFABProps> = ({
    onPress,
    onLongPress,
}) => {
    const { position, panResponder } = useDraggableFAB();
    
    // 波纹动画值
    const ripple1 = useRef(new Animated.Value(0)).current;
    const ripple2 = useRef(new Animated.Value(0)).current;
    const ripple3 = useRef(new Animated.Value(0)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);
    const isPressed = useRef(false);

    // 播放触觉反馈
    const playReadyFeedback = useCallback(async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.log('[Voice] Haptics error:', error);
        }
    }, []);

    // 单次波纹动画（慢速）
    const createSingleRipple = useCallback((ripple: Animated.Value) => {
        return Animated.sequence([
            Animated.timing(ripple, {
                toValue: 1,
                duration: 1200, // 更慢的扩散
                useNativeDriver: true,
            }),
            Animated.timing(ripple, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
            }),
        ]);
    }, []);

    // 启动持续波纹动画
    const startContinuousRipple = useCallback(() => {
        if (!isPressed.current) return;

        // 重置所有波纹
        ripple1.setValue(0);
        ripple2.setValue(0);
        ripple3.setValue(0);

        // 三层波纹依次扩散，间隔 400ms
        animationRef.current = Animated.stagger(400, [
            createSingleRipple(ripple1),
            createSingleRipple(ripple2),
            createSingleRipple(ripple3),
        ]);

        animationRef.current.start(() => {
            // 动画完成后继续循环
            if (isPressed.current) {
                startContinuousRipple();
            }
        });
    }, [ripple1, ripple2, ripple3, createSingleRipple]);

    // 停止波纹动画
    const stopRipple = useCallback(() => {
        isPressed.current = false;
        if (animationRef.current) {
            animationRef.current.stop();
            animationRef.current = null;
        }
        // 淡出所有波纹
        Animated.parallel([
            Animated.timing(ripple1, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(ripple2, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(ripple3, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
    }, [ripple1, ripple2, ripple3]);

    // 处理按下
    const handlePressIn = useCallback(() => {
        isPressed.current = true;
        playReadyFeedback();
        startContinuousRipple();
    }, [playReadyFeedback, startContinuousRipple]);

    // 处理松开
    const handlePressOut = useCallback(() => {
        stopRipple();
    }, [stopRipple]);

    // 波纹样式计算
    const createRippleStyle = (ripple: Animated.Value) => ({
        transform: [
            {
                scale: ripple.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2.2],
                }),
            },
        ],
        opacity: ripple.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0.5, 0.25, 0],
        }),
    });

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: position.getTranslateTransform() },
            ]}
            {...panResponder.panHandlers}
        >
            {/* 波纹层 */}
            <View style={styles.rippleContainer}>
                <Animated.View style={[styles.ripple, createRippleStyle(ripple1)]} />
                <Animated.View style={[styles.ripple, createRippleStyle(ripple2)]} />
                <Animated.View style={[styles.ripple, createRippleStyle(ripple3)]} />
            </View>

            {/* 主按钮 */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                onLongPress={onLongPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <LinearGradient
                    colors={[GRADIENTS.teal[0], GRADIENTS.teal[1]]}
                    style={styles.gradient}
                >
                    <Ionicons name="mic" size={26} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const SIZE = 56;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rippleContainer: {
        position: 'absolute',
        width: SIZE,
        height: SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ripple: {
        position: 'absolute',
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        backgroundColor: '#00C7BE',
    },
    gradient: {
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#00C7BE',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});

export default VoiceAssistantFAB;
