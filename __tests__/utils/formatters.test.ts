/**
 * 单元测试: utils/formatters.ts
 */

import {
    formatCurrency,
    formatHours,
    formatPercentageChange,
    formatRelativeTime,
    formatTime,
    formatDate,
    formatChatTimestamp,
    formatNumber,
    formatPercent,
} from '../../utils/formatters';

describe('formatCurrency', () => {
    it('should format integer as currency', () => {
        expect(formatCurrency(1000)).toBe('¥1000');
    });

    it('should format decimal as currency with 2 decimals', () => {
        expect(formatCurrency(1234.567)).toBe('¥1234.57');
    });

    it('should format zero correctly', () => {
        expect(formatCurrency(0)).toBe('¥0');
    });

    it('should handle negative numbers', () => {
        expect(formatCurrency(-500)).toBe('¥-500');
    });
});

describe('formatHours', () => {
    it('should format hours with h suffix', () => {
        expect(formatHours(5.5)).toBe('5.5h');
    });

    it('should format zero hours', () => {
        expect(formatHours(0)).toBe('0.0h');
    });

    it('should round to one decimal', () => {
        expect(formatHours(3.456)).toBe('3.5h');
    });
});

describe('formatPercentageChange', () => {
    it('should format positive change with + prefix', () => {
        expect(formatPercentageChange(15)).toBe('+15%');
    });

    it('should format negative change with - prefix', () => {
        expect(formatPercentageChange(-25)).toBe('-25%');
    });

    it('should format zero change', () => {
        expect(formatPercentageChange(0)).toBe('+0%');
    });
});

describe('formatTime', () => {
    it('should format time as HH:mm', () => {
        const date = new Date('2025-01-15T14:30:00');
        expect(formatTime(date)).toBe('14:30');
    });

    it('should pad single digit hours and minutes', () => {
        const date = new Date('2025-01-15T09:05:00');
        expect(formatTime(date)).toBe('09:05');
    });
});

describe('formatDate', () => {
    it('should format date as MM-DD', () => {
        const date = new Date('2025-01-15T14:30:00');
        expect(formatDate(date)).toBe('01-15');
    });
});

describe('formatRelativeTime', () => {
    it('should format just now', () => {
        const now = new Date();
        expect(formatRelativeTime(now)).toBe('刚刚');
    });

    it('should format minutes ago', () => {
        const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
        expect(formatRelativeTime(date)).toBe('5分钟前');
    });

    it('should format hours ago', () => {
        const date = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
        expect(formatRelativeTime(date)).toBe('2小时前');
    });

    it('should format days ago', () => {
        const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
        expect(formatRelativeTime(date)).toBe('3天前');
    });
});

describe('formatNumber', () => {
    it('should format large numbers with 万 suffix', () => {
        expect(formatNumber(50000)).toBe('5.0万');
    });

    it('should format thousands with K suffix', () => {
        expect(formatNumber(1500)).toBe('1.5K');
    });

    it('should keep small numbers as is', () => {
        expect(formatNumber(100)).toBe('100');
    });
});

describe('formatPercent', () => {
    it('should format percentage', () => {
        expect(formatPercent(75)).toBe('75%');
    });

    it('should format with decimals', () => {
        expect(formatPercent(33.333, 2)).toBe('33.33%');
    });
});
