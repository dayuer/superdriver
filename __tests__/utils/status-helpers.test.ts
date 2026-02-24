/**
 * 单元测试: utils/status-helpers.ts
 */

import {
    getStatusColor,
    getStatusBg,
    getStatusText,
    getStatusIcon,
    mapNotificationType,
    getNotificationColor,
    getNotificationIcon,
    getPriorityColor,
    getPriorityText,
} from '../../utils/status-helpers';

describe('getStatusColor', () => {
    it('should return green for online status', () => {
        expect(getStatusColor('online')).toBe('#34C759');
    });

    it('should return orange for busy status', () => {
        expect(getStatusColor('busy')).toBe('#FF9500');
    });

    it('should return grey for offline status', () => {
        expect(getStatusColor('offline')).toBe('#8E8E93');
    });

    it('should return grey for unknown status', () => {
        expect(getStatusColor('unknown')).toBe('#8E8E93');
    });
});

describe('getStatusBg', () => {
    it('should return semi-transparent green for online', () => {
        const result = getStatusBg('online');
        expect(result).toContain('rgba');
        expect(result).toContain('52, 199, 89');
    });

    it('should return semi-transparent orange for busy', () => {
        const result = getStatusBg('busy');
        expect(result).toContain('255, 149, 0');
    });

    it('should return semi-transparent grey for offline', () => {
        const result = getStatusBg('offline');
        expect(result).toContain('142, 142, 147');
    });
});

describe('getStatusText', () => {
    it('should return correct Chinese text for each status', () => {
        expect(getStatusText('online')).toBe('听单中');
        expect(getStatusText('busy')).toBe('服务中');
        expect(getStatusText('offline')).toBe('已下线');
    });

    it('should return default text for unknown status', () => {
        expect(getStatusText('unknown')).toBe('已下线');
    });
});

describe('getStatusIcon', () => {
    it('should return appropriate icons for each status', () => {
        expect(getStatusIcon('online')).toBe('radio-button-on');
        expect(getStatusIcon('busy')).toBe('time');
        expect(getStatusIcon('offline')).toBe('radio-button-off');
    });
});

describe('mapNotificationType', () => {
    it('should map order notification type correctly', () => {
        const result = mapNotificationType('order');
        expect(result).toEqual({
            color: '#007AFF',
            icon: 'receipt-outline',
            label: '订单',
        });
    });

    it('should map finance notification type correctly', () => {
        const result = mapNotificationType('finance');
        expect(result).toEqual({
            color: '#34C759',
            icon: 'cash-outline',
            label: '财务',
        });
    });

    it('should handle unknown types with default values', () => {
        const result = mapNotificationType('unknown_type');
        expect(result).toHaveProperty('color');
        expect(result).toHaveProperty('icon');
        expect(result).toHaveProperty('label');
        expect(result.label).toBe('消息');
    });
});

describe('getNotificationIcon', () => {
    it('should return correct icon for notification types', () => {
        expect(getNotificationIcon('order')).toBe('receipt');
        expect(getNotificationIcon('finance')).toBe('cash');
        expect(getNotificationIcon('alert')).toBe('notifications');
    });
});

describe('getPriorityColor', () => {
    it('should return red for high priority', () => {
        expect(getPriorityColor('high')).toBe('#FF3B30');
    });

    it('should return orange for medium priority', () => {
        expect(getPriorityColor('medium')).toBe('#FF9500');
    });

    it('should return grey for low priority', () => {
        expect(getPriorityColor('low')).toBe('#8E8E93');
    });
});

describe('getPriorityText', () => {
    it('should return correct Chinese text', () => {
        expect(getPriorityText('high')).toBe('紧急');
        expect(getPriorityText('medium')).toBe('普通');
        expect(getPriorityText('low')).toBe('一般');
    });
});
