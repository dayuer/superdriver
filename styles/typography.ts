/**
 * 字体排版样式
 * 统一管理字体大小、行高、字重
 */
import { StyleSheet, Platform } from 'react-native';
import { TEXT } from './colors';

// 字体尺寸
export const FONT_SIZE = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    hero: 36,
} as const;

// 字重
export const FONT_WEIGHT = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

// 预设字体样式
export const typography = StyleSheet.create({
    // 标题
    heroTitle: {
        fontSize: FONT_SIZE.hero,
        fontWeight: FONT_WEIGHT.bold,
        color: TEXT.inverse,
        letterSpacing: -1,
    },
    pageTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.bold,
        color: TEXT.primary,
    },
    pageTitleInverse: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.bold,
        color: TEXT.inverse,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: TEXT.primary,
    },
    cardTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold,
        color: TEXT.primary,
    },

    // 正文
    body: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.regular,
        color: TEXT.primary,
    },
    bodySecondary: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.regular,
        color: TEXT.secondary,
    },
    bodySmall: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.regular,
        color: TEXT.secondary,
    },

    // 标签
    label: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.medium,
        color: TEXT.secondary,
    },
    labelInverse: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.medium,
        color: TEXT.inverseSecondary,
    },
    caption: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.regular,
        color: TEXT.tertiary,
    },

    // 徽章文字
    badge: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
        color: TEXT.inverse,
    },

    // 数值显示
    statValue: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: TEXT.inverse,
    },
    statLabel: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.regular,
        color: TEXT.inverseTertiary,
    },

    // 按钮文字
    buttonPrimary: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold,
        color: TEXT.inverse,
    },
    buttonSecondary: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.medium,
        color: TEXT.primary,
    },
    buttonLink: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.medium,
        color: '#007AFF',
    },

    // Tab 标签
    tab: {
        fontSize: 11,
        fontWeight: FONT_WEIGHT.regular,
        color: TEXT.secondary,
    },
    tabActive: {
        fontSize: 11,
        fontWeight: FONT_WEIGHT.bold,
        color: TEXT.primary,
    },
});

export default typography;
