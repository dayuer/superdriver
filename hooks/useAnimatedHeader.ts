/**
 * 动画头部 Hook
 * 处理滚动时头部收缩/展开的动画逻辑
 */
import { useRef, useMemo } from 'react';
import { Animated, Platform } from 'react-native';
import { ANIMATION } from '../config/constants';

const { header } = ANIMATION;

export interface UseAnimatedHeaderReturn {
    scrollY: Animated.Value;
    headerHeight: Animated.AnimatedInterpolation<number>;
    expandedOpacity: Animated.AnimatedInterpolation<number>;
    compactOpacity: Animated.AnimatedInterpolation<number>;
    EXPANDED_HEIGHT: number;
    COMPACT_HEIGHT: number;
    SCROLL_RANGE: number;
    onScroll: Animated.Value;
}

export function useAnimatedHeader(): UseAnimatedHeaderReturn {
    const scrollY = useRef(new Animated.Value(0)).current;

    const EXPANDED_HEIGHT = header.expandedHeight;
    const COMPACT_HEIGHT = header.compactHeight;
    const SCROLL_RANGE = EXPANDED_HEIGHT - COMPACT_HEIGHT;

    // 头部高度动画
    const headerHeight = useMemo(() => scrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [EXPANDED_HEIGHT, COMPACT_HEIGHT],
        extrapolate: 'clamp',
    }), [scrollY, SCROLL_RANGE, EXPANDED_HEIGHT, COMPACT_HEIGHT]);

    // 展开状态透明度 (滚动时渐隐)
    const expandedOpacity = useMemo(() => scrollY.interpolate({
        inputRange: [0, SCROLL_RANGE * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    }), [scrollY, SCROLL_RANGE]);

    // 紧凑状态透明度 (滚动时渐显)
    const compactOpacity = useMemo(() => scrollY.interpolate({
        inputRange: [SCROLL_RANGE * 0.4, SCROLL_RANGE],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    }), [scrollY, SCROLL_RANGE]);

    return {
        scrollY,
        headerHeight,
        expandedOpacity,
        compactOpacity,
        EXPANDED_HEIGHT,
        COMPACT_HEIGHT,
        SCROLL_RANGE,
        onScroll: scrollY,
    };
}

export default useAnimatedHeader;
