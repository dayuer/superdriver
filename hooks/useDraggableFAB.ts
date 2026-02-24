/**
 * 可拖拽悬浮按钮 Hook
 * 处理FAB的拖拽和边缘吸附逻辑
 */
import { useRef } from 'react';
import { Animated, PanResponder, PanResponderInstance, Dimensions } from 'react-native';
import { ANIMATION, SCREEN } from '../config/constants';

const { fab } = ANIMATION;

export interface UseDraggableFABReturn {
    position: Animated.ValueXY;
    panResponder: PanResponderInstance;
}

export interface UseDraggableFABOptions {
    initialX?: number;
    initialY?: number;
    size?: number;
    margin?: number;
    minY?: number;
    maxY?: number;
}

export function useDraggableFAB(options: UseDraggableFABOptions = {}): UseDraggableFABReturn {
    const {
        initialX = SCREEN.width - fab.size - fab.margin,
        initialY = SCREEN.height - 200,
        size = fab.size,
        margin = fab.margin,
        minY = fab.minY,
        maxY = fab.maxY,
    } = options;

    const position = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: () => {
                // 记录当前位置作为偏移起点
                position.setOffset({
                    x: (position.x as any)._value,
                    y: (position.y as any)._value,
                });
                position.setValue({ x: 0, y: 0 });
            },

            onPanResponderMove: Animated.event(
                [null, { dx: position.x, dy: position.y }],
                { useNativeDriver: false }
            ),

            onPanResponderRelease: () => {
                position.flattenOffset();

                let finalX = (position.x as any)._value;
                let finalY = (position.y as any)._value;

                // Y 轴边界限制
                finalY = Math.max(minY, Math.min(maxY, finalY));

                // X 轴吸附到左边或右边
                if (finalX < SCREEN.width / 2) {
                    finalX = margin;
                } else {
                    finalX = SCREEN.width - size - margin;
                }

                // 弹簧动画到最终位置
                Animated.spring(position, {
                    toValue: { x: finalX, y: finalY },
                    useNativeDriver: false,
                    friction: 7,
                }).start();
            },
        })
    ).current;

    return {
        position,
        panResponder,
    };
}

export default useDraggableFAB;
