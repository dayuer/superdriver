/**
 * 通知状态管理 Hook
 */
import { useState, useMemo, useCallback } from 'react';
import { MOCK_NOTIFICATIONS, WorkflowNotification } from '../config/mock-data';

export interface UseNotificationsReturn {
    notifications: WorkflowNotification[];
    unreadCount: number;
    unreadNotifications: WorkflowNotification[];
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    addNotification: (notification: Omit<WorkflowNotification, 'id'>) => void;
    removeNotification: (id: string) => void;
}

export function useNotifications(initialNotifications = MOCK_NOTIFICATIONS): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<WorkflowNotification[]>(initialNotifications);

    // 计算未读数量
    const unreadCount = useMemo(
        () => notifications.filter(n => !n.isRead).length,
        [notifications]
    );

    // 获取未读通知
    const unreadNotifications = useMemo(
        () => notifications.filter(n => !n.isRead),
        [notifications]
    );

    // 标记单条为已读
    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => {
            if (n.id === id) {
                return { ...n, isRead: true };
            }
            return n;
        }));
    }, []);

    // 全部标记已读
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    // 添加通知
    const addNotification = useCallback((notification: Omit<WorkflowNotification, 'id'>) => {
        const newNotification: WorkflowNotification = {
            ...notification,
            id: `n_${Date.now()}`,
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    // 删除通知
    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return {
        notifications,
        unreadCount,
        unreadNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
    };
}

export default useNotifications;
