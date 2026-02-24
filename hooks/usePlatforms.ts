/**
 * 平台状态管理 Hook
 * 处理平台绑定、状态切换等逻辑
 */
import { useState, useMemo, useCallback } from 'react';
import { MOCK_PLATFORMS, PlatformBinding } from '../config/mock-data';

export interface UsePlatformsReturn {
    platforms: PlatformBinding[];
    boundPlatforms: PlatformBinding[];
    unboundPlatforms: PlatformBinding[];
    onlinePlatforms: number;
    totalRevenue: number;
    totalOrders: number;
    totalUnread: number;
    toggleStatus: (id: string) => void;
    toggleAll: (toOnline: boolean) => void;
    bindPlatform: (id: string) => void;
    unbindPlatform: (id: string) => void;
}

export function usePlatforms(initialPlatforms = MOCK_PLATFORMS): UsePlatformsReturn {
    const [platforms, setPlatforms] = useState<PlatformBinding[]>(initialPlatforms);

    // 计算派生状态
    const boundPlatforms = useMemo(
        () => platforms.filter(p => p.isBound),
        [platforms]
    );

    const unboundPlatforms = useMemo(
        () => platforms.filter(p => !p.isBound),
        [platforms]
    );

    const onlinePlatforms = useMemo(
        () => platforms.filter(p => p.isBound && p.status !== 'offline').length,
        [platforms]
    );

    const totalRevenue = useMemo(
        () => boundPlatforms.reduce((acc, p) => acc + p.todayRevenue, 0),
        [boundPlatforms]
    );

    const totalOrders = useMemo(
        () => boundPlatforms.reduce((acc, p) => acc + p.todayOrders, 0),
        [boundPlatforms]
    );

    const totalUnread = useMemo(
        () => boundPlatforms.reduce((acc, p) => acc + p.unreadNotifications, 0),
        [boundPlatforms]
    );

    // 切换单个平台状态 (上线/下线)
    const toggleStatus = useCallback((id: string) => {
        setPlatforms(prev => prev.map(p => {
            if (p.id === id && p.isBound) {
                const newStatus = p.status === 'online' ? 'offline' : 'online';
                return { ...p, status: newStatus };
            }
            return p;
        }));
    }, []);

    // 一键全部上线/下线
    const toggleAll = useCallback((toOnline: boolean) => {
        setPlatforms(prev => prev.map(p => {
            if (p.isBound) {
                return { ...p, status: toOnline ? 'online' : 'offline' };
            }
            return p;
        }));
    }, []);

    // 绑定平台
    const bindPlatform = useCallback((id: string) => {
        setPlatforms(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, isBound: true, status: 'offline' };
            }
            return p;
        }));
    }, []);

    // 解绑平台
    const unbindPlatform = useCallback((id: string) => {
        setPlatforms(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, isBound: false, status: 'offline', todayRevenue: 0, todayOrders: 0 };
            }
            return p;
        }));
    }, []);

    return {
        platforms,
        boundPlatforms,
        unboundPlatforms,
        onlinePlatforms,
        totalRevenue,
        totalOrders,
        totalUnread,
        toggleStatus,
        toggleAll,
        bindPlatform,
        unbindPlatform,
    };
}

export default usePlatforms;
