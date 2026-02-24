/**
 * 卡片相关通用样式
 * 用于各类业务卡片的复用样式
 */
import { StyleSheet, Platform } from 'react-native';
import { BACKGROUND, BORDER, TEXT, PRIMARY, SUCCESS, WARNING, DANGER } from './colors';
import { RADIUS, SPACING } from './base';

export const cards = StyleSheet.create({
    // 基础卡片容器
    container: {
        backgroundColor: BACKGROUND.card,
        borderRadius: RADIUS.lg,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },

    // 卡片头部
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
    },

    // 卡片内容区
    body: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
    },

    // Logo 容器
    logo: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoSmall: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    logoTextSmall: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },

    // 信息区
    info: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: TEXT.primary,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: TEXT.secondary,
    },
    metaDot: {
        fontSize: 12,
        color: TEXT.tertiary,
    },

    // 标签区
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    tag: {
        backgroundColor: '#F0F0F5',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 11,
        color: TEXT.secondary,
    },
    tagPrimary: {
        backgroundColor: `${PRIMARY}15`,
    },
    tagPrimaryText: {
        color: PRIMARY,
    },

    // 徽章
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: SUCCESS,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
    badgeNew: {
        backgroundColor: SUCCESS,
    },
    badgeHot: {
        backgroundColor: DANGER,
    },
    badgeBound: {
        backgroundColor: SUCCESS,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },

    // 操作按钮
    actionBtn: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        backgroundColor: `${PRIMARY}15`,
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: PRIMARY,
    },
    actionBtnBound: {
        backgroundColor: '#F0F0F5',
    },
    actionBtnTextBound: {
        color: TEXT.secondary,
    },

    // 底部促销区
    incentive: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: BORDER.light,
        gap: SPACING.sm,
    },
    incentiveText: {
        flex: 1,
        fontSize: 12,
        color: DANGER,
    },
});

export default cards;
