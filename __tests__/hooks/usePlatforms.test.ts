/**
 * 单元测试: hooks/usePlatforms.ts
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { usePlatforms } from '../../hooks/usePlatforms';
import { PlatformBinding } from '../../config/mock-data';

describe('usePlatforms', () => {
    const mockPlatforms: PlatformBinding[] = [
        { id: 'didi', name: '滴滴出行', logo: '🚕', color: '#FF6600', isBound: true, status: 'online', todayRevenue: 420, todayOrders: 8, unreadNotifications: 3 },
        { id: 'huolala', name: '货拉拉', logo: '🚛', color: '#00AA00', isBound: true, status: 'busy', todayRevenue: 180, todayOrders: 2, unreadNotifications: 1 },
        { id: 'caocao', name: '曹操出行', logo: '🚗', color: '#1890FF', isBound: false, status: 'offline', todayRevenue: 0, todayOrders: 0, unreadNotifications: 0 },
    ];

    it('should initialize with platforms from initial data', () => {
        const { result } = renderHook(() => usePlatforms(mockPlatforms));

        expect(result.current.platforms).toHaveLength(3);
        expect(result.current.totalRevenue).toBe(600); // 420 + 180
        expect(result.current.totalOrders).toBe(10); // 8 + 2
    });

    it('should toggle platform status', () => {
        const { result } = renderHook(() => usePlatforms(mockPlatforms));

        // didi 初始为 online
        expect(result.current.platforms.find(p => p.id === 'didi')?.status).toBe('online');

        act(() => {
            result.current.toggleStatus('didi');
        });

        expect(result.current.platforms.find(p => p.id === 'didi')?.status).toBe('offline');
    });

    it('should calculate totals correctly', () => {
        const { result } = renderHook(() => usePlatforms(mockPlatforms));

        expect(result.current.totalRevenue).toBe(600);
        expect(result.current.totalOrders).toBe(10);
        expect(result.current.totalUnread).toBe(4); // 3 + 1
    });

    it('should filter bound and unbound platforms', () => {
        const { result } = renderHook(() => usePlatforms(mockPlatforms));

        expect(result.current.boundPlatforms).toHaveLength(2);
        expect(result.current.unboundPlatforms).toHaveLength(1);
        expect(result.current.boundPlatforms.map(p => p.id)).toContain('didi');
        expect(result.current.boundPlatforms.map(p => p.id)).toContain('huolala');
        expect(result.current.unboundPlatforms.map(p => p.id)).toContain('caocao');
    });

    it('should count online platforms', () => {
        const { result } = renderHook(() => usePlatforms(mockPlatforms));

        // online + busy = 2 (didi + huolala)
        expect(result.current.onlinePlatforms).toBe(2);
    });

    it('should toggle all platforms status', () => {
        const { result } = renderHook(() => usePlatforms(mockPlatforms));

        act(() => {
            result.current.toggleAll(false);
        });

        const boundPlatforms = result.current.platforms.filter(p => p.isBound);
        expect(boundPlatforms.every(p => p.status === 'offline')).toBe(true);

        act(() => {
            result.current.toggleAll(true);
        });

        const updatedBoundPlatforms = result.current.platforms.filter(p => p.isBound);
        expect(updatedBoundPlatforms.every(p => p.status === 'online')).toBe(true);
    });

    it('should bind platform', () => {
        const { result } = renderHook(() => usePlatforms(mockPlatforms));

        expect(result.current.platforms.find(p => p.id === 'caocao')?.isBound).toBe(false);

        act(() => {
            result.current.bindPlatform('caocao');
        });

        expect(result.current.platforms.find(p => p.id === 'caocao')?.isBound).toBe(true);
    });

    it('should unbind platform', () => {
        const { result } = renderHook(() => usePlatforms(mockPlatforms));

        expect(result.current.platforms.find(p => p.id === 'didi')?.isBound).toBe(true);

        act(() => {
            result.current.unbindPlatform('didi');
        });

        expect(result.current.platforms.find(p => p.id === 'didi')?.isBound).toBe(false);
        expect(result.current.platforms.find(p => p.id === 'didi')?.todayRevenue).toBe(0);
    });
});
