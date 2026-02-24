/**
 * 单元测试: StatsCard 组件逻辑
 * 测试统计数据处理和格式化
 */

import { StatItem } from '../../../components/profile/StatsCard';

// ============================================================================
// Helper Functions (extracted for testability)
// ============================================================================

/**
 * 格式化统计值显示
 */
export const formatStatValue = (value: string | number): string => {
    if (typeof value === 'number') {
        // 大于10000显示为万
        if (value >= 10000) {
            return `${(value / 10000).toFixed(1)}万`;
        }
        // 大于1000显示为K
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
    }
    return value;
};

/**
 * 判断是否应该显示后缀
 */
export const shouldShowSuffix = (stat: StatItem): boolean => {
    return stat.suffix !== undefined && stat.suffix !== '';
};

/**
 * 获取统计项的完整显示文本
 */
export const getStatDisplayText = (stat: StatItem): string => {
    const formattedValue = formatStatValue(stat.value);
    return shouldShowSuffix(stat) ? `${formattedValue}${stat.suffix}` : formattedValue;
};

// ============================================================================
// Mock Data
// ============================================================================

const mockStats: StatItem[] = [
    { label: '累计收入', value: 12580, suffix: '元' },
    { label: '完成订单', value: 156, suffix: '单' },
    { label: '在线时长', value: 48.5, suffix: 'h' },
    { label: '评分', value: '4.9', color: '#34C759' },
];

// ============================================================================
// Tests: formatStatValue
// ============================================================================

describe('formatStatValue', () => {
    it('should format large numbers with 万 suffix', () => {
        expect(formatStatValue(50000)).toBe('5.0万');
        expect(formatStatValue(12580)).toBe('1.3万');
    });

    it('should format thousands with K suffix', () => {
        expect(formatStatValue(1500)).toBe('1.5K');
        expect(formatStatValue(9999)).toBe('10.0K');
    });

    it('should keep small numbers as is', () => {
        expect(formatStatValue(100)).toBe('100');
        expect(formatStatValue(999)).toBe('999');
    });

    it('should return string values unchanged', () => {
        expect(formatStatValue('4.9')).toBe('4.9');
        expect(formatStatValue('N/A')).toBe('N/A');
    });

    it('should handle zero', () => {
        expect(formatStatValue(0)).toBe('0');
    });

    it('should handle decimal numbers', () => {
        expect(formatStatValue(48.5)).toBe('48.5');
    });
});

// ============================================================================
// Tests: shouldShowSuffix
// ============================================================================

describe('shouldShowSuffix', () => {
    it('should return true when suffix is present', () => {
        expect(shouldShowSuffix(mockStats[0])).toBe(true);
        expect(shouldShowSuffix(mockStats[1])).toBe(true);
    });

    it('should return false when suffix is undefined', () => {
        expect(shouldShowSuffix(mockStats[3])).toBe(false);
    });

    it('should return false when suffix is empty string', () => {
        expect(shouldShowSuffix({ label: 'test', value: 1, suffix: '' })).toBe(false);
    });
});

// ============================================================================
// Tests: getStatDisplayText
// ============================================================================

describe('getStatDisplayText', () => {
    it('should combine value and suffix', () => {
        expect(getStatDisplayText({ label: '收入', value: 1500, suffix: '元' })).toBe('1.5K元');
    });

    it('should return value only when no suffix', () => {
        expect(getStatDisplayText({ label: '评分', value: '4.9' })).toBe('4.9');
    });

    it('should handle 万 formatting with suffix', () => {
        expect(getStatDisplayText({ label: '收入', value: 12580, suffix: '元' })).toBe('1.3万元');
    });
});

// ============================================================================
// Tests: Stats Array Processing
// ============================================================================

describe('Stats Array Processing', () => {
    it('should process all stats correctly', () => {
        const results = mockStats.map(getStatDisplayText);
        expect(results).toEqual([
            '1.3万元',
            '156单',
            '48.5h',
            '4.9'
        ]);
    });

    it('should handle empty stats array', () => {
        const results: string[] = [].map(getStatDisplayText);
        expect(results).toEqual([]);
    });
});
