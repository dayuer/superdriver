/**
 * 基础布局样式
 * 常用的 flex、间距、阴影等复用样式
 */
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { BACKGROUND, BORDER } from './colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 间距常量
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
} as const;

// 圆角
export const RADIUS = {
    sm: 6,
    md: 10,
    lg: 12,
    xl: 16,
    round: 9999,
} as const;

// 屏幕尺寸
export const SCREEN = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
} as const;

// 头部动画常量
export const HEADER = {
    expandedHeight: Platform.OS === 'ios' ? 200 : 180,
    compactHeight: Platform.OS === 'ios' ? 80 : 70,
    get scrollRange() { return this.expandedHeight - this.compactHeight; },
} as const;

// 阴影样式
export const SHADOWS = StyleSheet.create({
    sm: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
        },
        android: {
            elevation: 1,
        },
    }) as any,
    md: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        android: {
            elevation: 3,
        },
    }) as any,
    lg: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
        },
        android: {
            elevation: 6,
        },
    }) as any,
});

// 基础布局样式
export const base = StyleSheet.create({
    // Flex 布局
    flex1: { flex: 1 },
    flexGrow: { flexGrow: 1 },
    flexShrink: { flexShrink: 1 },

    // 方向
    row: { flexDirection: 'row' },
    rowReverse: { flexDirection: 'row-reverse' },
    column: { flexDirection: 'column' },

    // 对齐
    center: { alignItems: 'center', justifyContent: 'center' },
    centerH: { alignItems: 'center' },
    centerV: { justifyContent: 'center' },
    spaceBetween: { justifyContent: 'space-between' },
    spaceAround: { justifyContent: 'space-around' },
    alignStart: { alignItems: 'flex-start' },
    alignEnd: { alignItems: 'flex-end' },
    justifyEnd: { justifyContent: 'flex-end' },

    // 容器
    container: {
        flex: 1,
        backgroundColor: BACKGROUND.primary,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },

    // 卡片
    card: {
        backgroundColor: BACKGROUND.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cardFlat: {
        backgroundColor: BACKGROUND.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
    },

    // 分割线
    divider: {
        height: 1,
        backgroundColor: BORDER.light,
    },
    dividerVertical: {
        width: 1,
        backgroundColor: BORDER.light,
    },

    // 绝对定位
    absolute: { position: 'absolute' },
    absoluteFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    // 隐藏溢出
    overflowHidden: { overflow: 'hidden' },

    // 常用间距
    gap4: { gap: 4 },
    gap8: { gap: 8 },
    gap12: { gap: 12 },
    gap16: { gap: 16 },

    p8: { padding: 8 },
    p12: { padding: 12 },
    p16: { padding: 16 },
    p20: { padding: 20 },

    ph16: { paddingHorizontal: 16 },
    ph20: { paddingHorizontal: 20 },
    pv8: { paddingVertical: 8 },
    pv12: { paddingVertical: 12 },

    mb8: { marginBottom: 8 },
    mb12: { marginBottom: 12 },
    mb16: { marginBottom: 16 },
    mt8: { marginTop: 8 },
    mt12: { marginTop: 12 },
});

export default base;
