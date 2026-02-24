/**
 * CommandDeck 工具函数
 * 统计计算和数据处理逻辑
 */

import { EnterpriseMetric } from '../types';

/**
 * 计算企业统计数据
 * @param enterprises 企业数据列表
 * @returns 汇总统计对象
 */
export const calculateEnterpriseStats = (enterprises: EnterpriseMetric[]) => ({
    totalRevenue: enterprises.reduce((acc, curr) => acc + curr.metrics.revenue, 0),
    totalOrders: enterprises.reduce((acc, curr) => acc + curr.metrics.orders, 0),
    totalHours: enterprises.reduce((acc, curr) => acc + curr.metrics.onlineHours, 0),
});

/**
 * 计算在线企业数量
 */
export const countOnlineEnterprises = (enterprises: EnterpriseMetric[]): number => {
    return enterprises.filter(e => e.metrics.status === 'online').length;
};

/**
 * 获取最新情报
 */
export const getLatestIntel = (enterprises: EnterpriseMetric[]): string | undefined => {
    const withIntel = enterprises.filter(e => e.latestIntel);
    return withIntel.length > 0 ? withIntel[0].latestIntel : undefined;
};
