/**
 * 单元测试: CommandDeck 工具函数
 * 测试统计计算逻辑
 */

import { calculateEnterpriseStats, countOnlineEnterprises, getLatestIntel } from '../../utils/commandDeck-helpers';
import { EnterpriseMetric } from '../../types';

// ============================================================================
// Mock Data
// ============================================================================

const mockEnterprises: EnterpriseMetric[] = [
    {
        id: '1',
        name: '美团',
        color: '#FFC107',
        metrics: {
            revenue: 150.5,
            orders: 10,
            onlineHours: 5.5,
            percentile: 85,
            status: 'online'
        },
        latestIntel: '新订单：附近有高价值订单'
    },
    {
        id: '2',
        name: '饿了么',
        color: '#2196F3',
        metrics: {
            revenue: 200.25,
            orders: 15,
            onlineHours: 6.0,
            percentile: 72,
            status: 'busy'
        }
    },
    {
        id: '3',
        name: '滴滴',
        color: '#FF5722',
        metrics: {
            revenue: 320.0,
            orders: 8,
            onlineHours: 4.5,
            percentile: 90,
            status: 'offline'
        }
    }
];

// ============================================================================
// Tests: calculateEnterpriseStats
// ============================================================================

describe('calculateEnterpriseStats', () => {
    it('should calculate total revenue correctly', () => {
        const stats = calculateEnterpriseStats(mockEnterprises);
        // 150.5 + 200.25 + 320.0 = 670.75
        expect(stats.totalRevenue).toBeCloseTo(670.75, 2);
    });

    it('should calculate total orders correctly', () => {
        const stats = calculateEnterpriseStats(mockEnterprises);
        // 10 + 15 + 8 = 33
        expect(stats.totalOrders).toBe(33);
    });

    it('should calculate total hours correctly', () => {
        const stats = calculateEnterpriseStats(mockEnterprises);
        // 5.5 + 6.0 + 4.5 = 16.0
        expect(stats.totalHours).toBeCloseTo(16.0, 1);
    });

    it('should handle empty array', () => {
        const stats = calculateEnterpriseStats([]);
        expect(stats.totalRevenue).toBe(0);
        expect(stats.totalOrders).toBe(0);
        expect(stats.totalHours).toBe(0);
    });

    it('should handle single enterprise', () => {
        const stats = calculateEnterpriseStats([mockEnterprises[0]]);
        expect(stats.totalRevenue).toBe(150.5);
        expect(stats.totalOrders).toBe(10);
        expect(stats.totalHours).toBe(5.5);
    });
});

// ============================================================================
// Tests: countOnlineEnterprises
// ============================================================================

describe('countOnlineEnterprises', () => {
    it('should count online enterprises', () => {
        expect(countOnlineEnterprises(mockEnterprises)).toBe(1);
    });

    it('should return 0 for empty array', () => {
        expect(countOnlineEnterprises([])).toBe(0);
    });

    it('should return 0 when no enterprises are online', () => {
        const offlineEnterprises = mockEnterprises.map(e => ({
            ...e,
            metrics: { ...e.metrics, status: 'offline' as const }
        }));
        expect(countOnlineEnterprises(offlineEnterprises)).toBe(0);
    });
});

// ============================================================================
// Tests: getLatestIntel
// ============================================================================

describe('getLatestIntel', () => {
    it('should return latest intel from first enterprise with intel', () => {
        const intel = getLatestIntel(mockEnterprises);
        expect(intel).toBe('新订单：附近有高价值订单');
    });

    it('should return undefined when no intel exists', () => {
        const noIntelEnterprises = mockEnterprises.map(({ latestIntel, ...e }) => e);
        const intel = getLatestIntel(noIntelEnterprises as EnterpriseMetric[]);
        expect(intel).toBeUndefined();
    });

    it('should return undefined for empty array', () => {
        expect(getLatestIntel([])).toBeUndefined();
    });
});
