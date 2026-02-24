/**
 * 状态映射工具函数
 * 集中管理状态到颜色、文本、图标的映射
 */

import { STATUS_COLORS, NOTIFICATION_COLORS, TEXT } from '../styles/colors';

// ============================================================================
// 平台状态映射
// ============================================================================

export type PlatformStatus = 'online' | 'busy' | 'offline';

/**
 * 获取平台状态对应的颜色
 */
export const getStatusColor = (status: PlatformStatus | string): string => {
    return STATUS_COLORS[status as PlatformStatus] ?? STATUS_COLORS.offline;
};

/**
 * 获取平台状态对应的文本
 */
export const getStatusText = (status: PlatformStatus | string): string => {
    const map: Record<string, string> = {
        online: '听单中',
        busy: '服务中',
        offline: '已下线',
    };
    return map[status] ?? '已下线';
};

/**
 * 获取平台状态对应的背景色 (带透明度)
 */
export const getStatusBg = (status: PlatformStatus | string): string => {
    const map: Record<string, string> = {
        online: 'rgba(52, 199, 89, 0.12)',
        busy: 'rgba(255, 149, 0, 0.12)',
        offline: 'rgba(142, 142, 147, 0.12)',
    };
    return map[status] ?? map.offline;
};

/**
 * 获取平台状态对应的图标 (Ionicons)
 */
export const getStatusIcon = (status: PlatformStatus | string): string => {
    const map: Record<string, string> = {
        online: 'radio-button-on',
        busy: 'time',
        offline: 'radio-button-off',
    };
    return map[status] ?? 'radio-button-off';
};

/**
 * 映射通知类型到完整配置
 */
export const mapNotificationType = (type: NotificationType | string): { color: string; icon: string; label: string } => {
    const map: Record<string, { color: string; icon: string; label: string }> = {
        order: { color: '#007AFF', icon: 'receipt-outline', label: '订单' },
        finance: { color: '#34C759', icon: 'cash-outline', label: '财务' },
        alert: { color: '#FF9500', icon: 'notifications-outline', label: '提醒' },
        system: { color: '#FF3B30', icon: 'warning-outline', label: '系统' },
        promotion: { color: '#AF52DE', icon: 'gift-outline', label: '活动' },
    };
    return map[type] ?? { color: '#8E8E93', icon: 'information-circle-outline', label: '消息' };
};

// ============================================================================
// 通知类型映射
// ============================================================================

export type NotificationType = 'order' | 'finance' | 'alert' | 'system' | 'promotion';

/**
 * 获取通知类型对应的图标名称 (Ionicons)
 */
export const getNotificationIcon = (type: NotificationType | string): string => {
    const map: Record<string, string> = {
        order: 'receipt',
        finance: 'cash',
        alert: 'notifications',
        system: 'warning',
        promotion: 'gift',
    };
    return map[type] ?? 'information-circle';
};

/**
 * 获取通知类型对应的颜色
 */
export const getNotificationColor = (type: NotificationType | string): string => {
    return NOTIFICATION_COLORS[type as NotificationType] ?? TEXT.secondary;
};

// ============================================================================
// 优先级映射
// ============================================================================

export type Priority = 'high' | 'medium' | 'low';

/**
 * 获取优先级对应的颜色
 */
export const getPriorityColor = (priority: Priority | string): string => {
    const map: Record<string, string> = {
        high: '#FF3B30',
        medium: '#FF9500',
        low: '#8E8E93',
    };
    return map[priority] ?? map.low;
};

/**
 * 获取优先级对应的文本
 */
export const getPriorityText = (priority: Priority | string): string => {
    const map: Record<string, string> = {
        high: '紧急',
        medium: '普通',
        low: '一般',
    };
    return map[priority] ?? '一般';
};
