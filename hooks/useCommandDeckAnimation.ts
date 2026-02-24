/**
 * Hook: useCommandDeckAnimation
 * 管理 CommandDeck 的折叠/展开动画状态
 */
import { useMemo } from 'react';
import { Animated, Platform } from 'react-native';

export interface CommandDeckAnimationConfig {
    expandedHeight?: number;
    compactHeight?: number;
    scrollRange?: number;
}

export interface CommandDeckAnimationResult {
    containerHeight: Animated.AnimatedInterpolation<string | number>;
    expandedOpacity: Animated.AnimatedInterpolation<string | number>;
    compactOpacity: Animated.AnimatedInterpolation<string | number>;
    config: Required<CommandDeckAnimationConfig>;
}

const DEFAULT_CONFIG: Required<CommandDeckAnimationConfig> = {
    expandedHeight: 280,
    compactHeight: Platform.OS === 'ios' ? 100 : 80,
    scrollRange: 120,
};

export function useCommandDeckAnimation(
    scrollY: Animated.Value,
    config?: CommandDeckAnimationConfig
): CommandDeckAnimationResult {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const { expandedHeight, compactHeight, scrollRange } = finalConfig;

    const containerHeight = useMemo(
        () =>
            scrollY.interpolate({
                inputRange: [0, scrollRange],
                outputRange: [expandedHeight, compactHeight],
                extrapolate: 'clamp',
            }),
        [scrollY, scrollRange, expandedHeight, compactHeight]
    );

    const expandedOpacity = useMemo(
        () =>
            scrollY.interpolate({
                inputRange: [0, scrollRange * 0.5],
                outputRange: [1, 0],
                extrapolate: 'clamp',
            }),
        [scrollY, scrollRange]
    );

    const compactOpacity = useMemo(
        () =>
            scrollY.interpolate({
                inputRange: [scrollRange * 0.5, scrollRange],
                outputRange: [0, 1],
                extrapolate: 'clamp',
            }),
        [scrollY, scrollRange]
    );

    return {
        containerHeight,
        expandedOpacity,
        compactOpacity,
        config: finalConfig,
    };
}

export default useCommandDeckAnimation;
