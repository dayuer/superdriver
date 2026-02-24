/**
 * 单元测试: hooks/useNotifications.ts
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useNotifications } from '../../hooks/useNotifications';
import { WorkflowNotification } from '../../config/mock-data';

describe('useNotifications', () => {
    const mockNotifications: WorkflowNotification[] = [
        { id: 'n1', type: 'order', title: '新订单提醒', content: '新订单来了', timestamp: '刚刚', isRead: false, priority: 'high' },
        { id: 'n2', type: 'finance', title: '收入到账', content: '收入已到账', timestamp: '10分钟前', isRead: false, priority: 'medium' },
        { id: 'n3', type: 'alert', title: '系统通知', content: '系统维护', timestamp: '1小时前', isRead: true, priority: 'low' },
    ];

    it('should initialize with notifications', () => {
        const { result } = renderHook(() => useNotifications(mockNotifications));

        expect(result.current.notifications).toHaveLength(3);
        expect(result.current.unreadCount).toBe(2);
    });

    it('should mark notification as read', () => {
        const { result } = renderHook(() => useNotifications(mockNotifications));

        act(() => {
            result.current.markAsRead('n1');
        });

        expect(result.current.unreadCount).toBe(1);
        expect(result.current.notifications.find(n => n.id === 'n1')?.isRead).toBe(true);
    });

    it('should mark all as read', () => {
        const { result } = renderHook(() => useNotifications(mockNotifications));

        act(() => {
            result.current.markAllAsRead();
        });

        expect(result.current.unreadCount).toBe(0);
        expect(result.current.notifications.every(n => n.isRead)).toBe(true);
    });

    it('should get unread notifications', () => {
        const { result } = renderHook(() => useNotifications(mockNotifications));

        expect(result.current.unreadNotifications).toHaveLength(2);
        expect(result.current.unreadNotifications.map(n => n.id)).toContain('n1');
        expect(result.current.unreadNotifications.map(n => n.id)).toContain('n2');
    });

    it('should add new notification', () => {
        const { result } = renderHook(() => useNotifications(mockNotifications));

        act(() => {
            result.current.addNotification({
                type: 'system',
                title: '新消息',
                content: '这是新消息内容',
                timestamp: '刚刚',
                isRead: false,
                priority: 'medium',
            });
        });

        expect(result.current.notifications).toHaveLength(4);
        expect(result.current.unreadCount).toBe(3);
    });

    it('should remove notification', () => {
        const { result } = renderHook(() => useNotifications(mockNotifications));

        act(() => {
            result.current.removeNotification('n1');
        });

        expect(result.current.notifications).toHaveLength(2);
        expect(result.current.notifications.find(n => n.id === 'n1')).toBeUndefined();
        expect(result.current.unreadCount).toBe(1);
    });
});
